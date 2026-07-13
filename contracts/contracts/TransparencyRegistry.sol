// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title TransparencyRegistry
/// @notice Immutable proofs of completed donations and disbursements.
/// @dev Stores only identifiers, a proof hash, and a timestamp. No personal
///      data is ever stored on-chain (see docs/BLOCKCHAIN_ARCHITECTURE.md).
///      Only the deploying backend wallet may record proofs.
contract TransparencyRegistry {
    enum RecordType {
        Donation,
        Disbursement
    }

    struct Proof {
        uint256 recordId;
        uint256 campaignId;
        bytes32 proofHash;
        uint64 timestamp;
        RecordType recordType;
        bool exists;
    }

    address public immutable owner;
    uint256 public donationCount;
    uint256 public disbursementCount;

    // key = keccak256(recordType, recordId) => proof
    mapping(bytes32 => Proof) private _proofs;

    event DonationRecorded(
        uint256 indexed donationId,
        uint256 indexed campaignId,
        bytes32 proofHash,
        uint64 timestamp
    );
    event DisbursementRecorded(
        uint256 indexed disbursementId,
        uint256 indexed campaignId,
        bytes32 proofHash,
        uint64 timestamp
    );

    error NotOwner();
    error ProofAlreadyExists();
    error ProofNotFound();
    error InvalidProofHash();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // --- Recording (backend only) ---

    function registerDonation(
        uint256 donationId,
        uint256 campaignId,
        bytes32 proofHash
    ) external onlyOwner {
        _register(RecordType.Donation, donationId, campaignId, proofHash);
        donationCount++;
        emit DonationRecorded(donationId, campaignId, proofHash, uint64(block.timestamp));
    }

    function registerDisbursement(
        uint256 disbursementId,
        uint256 campaignId,
        bytes32 proofHash
    ) external onlyOwner {
        _register(RecordType.Disbursement, disbursementId, campaignId, proofHash);
        disbursementCount++;
        emit DisbursementRecorded(disbursementId, campaignId, proofHash, uint64(block.timestamp));
    }

    // --- Verification (public, read-only) ---

    function getDonation(uint256 donationId) external view returns (Proof memory) {
        return _get(RecordType.Donation, donationId);
    }

    function getDisbursement(uint256 disbursementId) external view returns (Proof memory) {
        return _get(RecordType.Disbursement, disbursementId);
    }

    function verifyDonation(uint256 donationId, bytes32 proofHash) external view returns (bool) {
        return _verify(RecordType.Donation, donationId, proofHash);
    }

    function verifyDisbursement(
        uint256 disbursementId,
        bytes32 proofHash
    ) external view returns (bool) {
        return _verify(RecordType.Disbursement, disbursementId, proofHash);
    }

    // --- Internal ---

    function _register(
        RecordType recordType,
        uint256 recordId,
        uint256 campaignId,
        bytes32 proofHash
    ) private {
        if (proofHash == bytes32(0)) revert InvalidProofHash();
        bytes32 key = _key(recordType, recordId);
        if (_proofs[key].exists) revert ProofAlreadyExists();
        _proofs[key] = Proof({
            recordId: recordId,
            campaignId: campaignId,
            proofHash: proofHash,
            timestamp: uint64(block.timestamp),
            recordType: recordType,
            exists: true
        });
    }

    function _get(RecordType recordType, uint256 recordId) private view returns (Proof memory) {
        bytes32 key = _key(recordType, recordId);
        if (!_proofs[key].exists) revert ProofNotFound();
        return _proofs[key];
    }

    function _verify(
        RecordType recordType,
        uint256 recordId,
        bytes32 proofHash
    ) private view returns (bool) {
        Proof storage stored = _proofs[_key(recordType, recordId)];
        return stored.exists && stored.proofHash == proofHash;
    }

    function _key(RecordType recordType, uint256 recordId) private pure returns (bytes32) {
        return keccak256(abi.encodePacked(recordType, recordId));
    }
}
