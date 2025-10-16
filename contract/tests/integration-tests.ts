// integration-tests.ts
// End-to-end integration tests for shooter-game contract

import { Clarinet, Tx, Chain, Account, types } from "https://deno.land/x/clarinet@v1.7.0/index.ts";

Clarinet.test({
  name: "Complete flow: start-session -> report-result -> claim-reward",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player = accounts.get("wallet_1")!;
    const owner = accounts.get("deployer")!;
    
    // Setup trusted server
    const serverPubkey = "0x02" + "a".repeat(64);
    chain.mineBlock([
      Tx.contractCall("shooter-game", "set-trusted-server", [
        types.buff(serverPubkey),
        types.bool(true)
      ], owner.address)
    ]);
    
    // 1. Start session
    const block1 = chain.mineBlock([
      Tx.contractCall("shooter-game", "start-session", [
        types.principal(player.address),
        types.uint(1)
      ], player.address)
    ]);
    
    const sessionId = block1.receipts[0].result.expectOk().expectUint(0);
    
    // 2. Simulate off-chain gameplay and result generation
    const canonicalPayload = {
      sessionId: sessionId,
      player: player.address,
      score: 1500,
      kills: 25,
      timestamp: Date.now()
    };
    
    // In real implementation, this would be done off-chain
    const resultHash = "0x" + "simulated_hash_32_bytes".repeat(2);
    const signature = "0x" + "simulated_signature_64_bytes".repeat(2);
    
    // 3. Report result
    const block2 = chain.mineBlock([
      Tx.contractCall("shooter-game", "report-result", [
        types.uint(sessionId),
        types.buff(resultHash),
        types.buff(signature),
        types.buff(serverPubkey),
        types.none()
      ], player.address)
    ]);
    
    block2.receipts[0].result.expectOk();
    
    // 4. Verify session is finalized
    const session = chain.callReadOnlyFn("shooter-game", "get-session", [
      types.uint(sessionId)
    ], player.address);
    
    session.result.expectSome().expectTuple({
      status: types.ascii("finalized"),
      "result-hash": types.some(types.buff(resultHash))
    });
    
    // 5. Claim reward (STX)
    const block3 = chain.mineBlock([
      Tx.contractCall("shooter-game", "claim-reward", [
        types.uint(sessionId),
        types.none(),
        types.uint(1000000) // 1 STX in microSTX
      ], player.address)
    ]);
    
    block3.receipts[0].result.expectOk();
    
    // 6. Verify reward is recorded
    const reward = chain.callReadOnlyFn("shooter-game", "get-pending-reward", [
      types.uint(sessionId)
    ], player.address);
    
    reward.result.expectSome().expectTuple({
      player: types.principal(player.address),
      "ft-contract": types.none(),
      amount: types.uint(1000000)
    });
  }
});

Clarinet.test({
  name: "NFT stats update flow",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player = accounts.get("wallet_1")!;
    const owner = accounts.get("deployer")!;
    
    // Setup trusted server
    const serverPubkey = "0x02" + "a".repeat(64);
    chain.mineBlock([
      Tx.contractCall("shooter-game", "set-trusted-server", [
        types.buff(serverPubkey),
        types.bool(true)
      ], owner.address)
    ]);
    
    // Create session
    const block1 = chain.mineBlock([
      Tx.contractCall("shooter-game", "start-session", [
        types.principal(player.address),
        types.uint(1)
      ], player.address)
    ]);
    
    const sessionId = block1.receipts[0].result.expectOk().expectUint(0);
    
    // Simulate meta with NFT exp data
    const meta = new Uint8Array(16);
    // First 8 bytes: canonical score (1500)
    const score = 1500;
    meta[0] = (score >> 56) & 0xFF;
    meta[1] = (score >> 48) & 0xFF;
    meta[2] = (score >> 40) & 0xFF;
    meta[3] = (score >> 32) & 0xFF;
    meta[4] = (score >> 24) & 0xFF;
    meta[5] = (score >> 16) & 0xFF;
    meta[6] = (score >> 8) & 0xFF;
    meta[7] = score & 0xFF;
    
    const resultHash = "0x" + "nft_test_hash_32_bytes".repeat(2);
    const signature = "0x" + "nft_test_signature_64".repeat(2);
    
    // Report result with meta
    const block2 = chain.mineBlock([
      Tx.contractCall("shooter-game", "report-result", [
        types.uint(sessionId),
        types.buff(resultHash),
        types.buff(signature),
        types.buff(serverPubkey),
        types.some(types.buff(meta))
      ], player.address)
    ]);
    
    block2.receipts[0].result.expectOk();
  }
});

Clarinet.test({
  name: "Dispute window enforcement",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player = accounts.get("wallet_1")!;
    const disputer = accounts.get("wallet_2")!;
    
    // Create session
    const block1 = chain.mineBlock([
      Tx.contractCall("shooter-game", "start-session", [
        types.principal(player.address),
        types.uint(1)
      ], player.address)
    ]);
    
    const sessionId = block1.receipts[0].result.expectOk().expectUint(0);
    
    // Mine blocks to simulate time passage (dispute window is 120 blocks)
    for (let i = 0; i < 125; i++) {
      chain.mineEmptyBlock();
    }
    
    // Try to open dispute after window
    const block2 = chain.mineBlock([
      Tx.contractCall("shooter-game", "open-dispute", [
        types.uint(sessionId),
        types.buff("0x" + "late_dispute".repeat(10))
      ], disputer.address)
    ]);
    
    // Should fail due to dispute window expiry
    block2.receipts[0].result.expectErr().expectUint(108);
  }
});

Clarinet.test({
  name: "Multiple sessions and replay protection",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player1 = accounts.get("wallet_1")!;
    const player2 = accounts.get("wallet_2")!;
    const owner = accounts.get("deployer")!;
    
    // Setup trusted server
    const serverPubkey = "0x02" + "a".repeat(64);
    chain.mineBlock([
      Tx.contractCall("shooter-game", "set-trusted-server", [
        types.buff(serverPubkey),
        types.bool(true)
      ], owner.address)
    ]);
    
    // Create multiple sessions
    const block1 = chain.mineBlock([
      Tx.contractCall("shooter-game", "start-session", [
        types.principal(player1.address),
        types.uint(1)
      ], player1.address),
      Tx.contractCall("shooter-game", "start-session", [
        types.principal(player2.address),
        types.uint(1)
      ], player2.address)
    ]);
    
    const sessionId1 = block1.receipts[0].result.expectOk().expectUint(0);
    const sessionId2 = block1.receipts[1].result.expectOk().expectUint(1);
    
    const resultHash = "0x" + "shared_result_hash_32".repeat(2);
    const signature = "0x" + "shared_signature_64".repeat(2);
    
    // First player reports result
    const block2 = chain.mineBlock([
      Tx.contractCall("shooter-game", "report-result", [
        types.uint(sessionId1),
        types.buff(resultHash),
        types.buff(signature),
        types.buff(serverPubkey),
        types.none()
      ], player1.address)
    ]);
    
    block2.receipts[0].result.expectOk();
    
    // Second player tries to use same result hash
    const block3 = chain.mineBlock([
      Tx.contractCall("shooter-game", "report-result", [
        types.uint(sessionId2),
        types.buff(resultHash),
        types.buff(signature),
        types.buff(serverPubkey),
        types.none()
      ], player2.address)
    ]);
    
    // Should fail due to replay protection
    block3.receipts[0].result.expectErr().expectUint(105);
  }
});
