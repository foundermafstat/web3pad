import { Clarinet, Tx, Chain, Account, types } from "https://deno.land/x/clarinet@v1.7.1/index.ts";
import { assertEquals, assert } from "https://deno.land/std@0.90.0/testing/asserts.ts";

Clarinet.test({
  name: "Contract deployment and initialization",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    
    // Test that contract deploys successfully
    const block = chain.mineBlock([
      Tx.contractCall("shooter-game", "get-contract-stats", [], deployer.address)
    ]);
    
    assertEquals(block.receipts.length, 1);
    block.receipts[0].result.expectOk();
  }
});

Clarinet.test({
  name: "Trusted server management",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const serverPubkey = "0x02a1633cafcc01ebfb6d78e39f687a1f0995c62fc95f51ead10a02ee0be551b5dc";
    
    // Test setting trusted server
    let block = chain.mineBlock([
      Tx.contractCall(
        "shooter-game", 
        "set-trusted-server", 
        [
          types.buff(serverPubkey),
          types.bool(true),
          types.ascii("Test Server")
        ], 
        deployer.address
      )
    ]);
    
    block.receipts[0].result.expectOk();
    
    // Test checking if server is trusted
    block = chain.mineBlock([
      Tx.contractCall(
        "shooter-game",
        "is-trusted-server",
        [types.buff(serverPubkey)],
        deployer.address
      )
    ]);
    
    block.receipts[0].result.expectOk().expectBool(true);
    
    // Test non-owner cannot set trusted server
    const user = accounts.get("wallet_1")!;
    block = chain.mineBlock([
      Tx.contractCall(
        "shooter-game", 
        "set-trusted-server", 
        [
          types.buff(serverPubkey),
          types.bool(true),
          types.ascii("Test Server")
        ], 
        user.address
      )
    ]);
    
    block.receipts[0].result.expectErr().expectUint(100); // err-unauthorised
  }
});

Clarinet.test({
  name: "Game session lifecycle",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const player = accounts.get("wallet_1")!;
    
    // Start a game session
    let block = chain.mineBlock([
      Tx.contractCall(
        "shooter-game",
        "start-session",
        [
          types.principal(player.address),
          types.some(types.uint(1)) // NFT token ID
        ],
        player.address
      )
    ]);
    
    block.receipts[0].result.expectOk().expectUint(0); // session ID 0
    
    // Check session exists
    block = chain.mineBlock([
      Tx.contractCall(
        "shooter-game",
        "get-session",
        [types.uint(0)],
        player.address
      )
    ]);
    
    const session = block.receipts[0].result.expectSome().expectTuple();
    session["player"].expectPrincipal(player.address);
    session["status"].expectAscii("open");
  }
});

Clarinet.test({
  name: "Game result reporting with signature verification",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const player = accounts.get("wallet_1")!;
    const serverPubkey = "0x02a1633cafcc01ebfb6d78e39f687a1f0995c62fc95f51ead10a02ee0be551b5dc";
    const serverPrivateKey = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    
    // Set up trusted server
    chain.mineBlock([
      Tx.contractCall(
        "shooter-game", 
        "set-trusted-server", 
        [
          types.buff(serverPubkey),
          types.bool(true),
          types.ascii("Test Server")
        ], 
        deployer.address
      )
    ]);
    
    // Start session
    chain.mineBlock([
      Tx.contractCall(
        "shooter-game",
        "start-session",
        [
          types.principal(player.address),
          types.some(types.uint(1))
        ],
        player.address
      )
    ]);
    
    // Create mock result hash and signature
    const resultHash = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    const signature = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    
    // Report result
    const block = chain.mineBlock([
      Tx.contractCall(
        "shooter-game",
        "report-result",
        [
          types.uint(0), // session ID
          types.buff(resultHash),
          types.buff(signature),
          types.buff(serverPubkey),
          types.uint(1500), // score
          types.uint(50), // exp gained
          types.none() // meta
        ],
        player.address
      )
    ]);
    
    // Note: This will fail without proper signature, but tests the flow
    // In real implementation, you'd use proper secp256k1 signing
    block.receipts[0].result.expectErr().expectUint(103); // err-invalid-sig
  }
});

Clarinet.test({
  name: "NFT progression system",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const player = accounts.get("wallet_1")!;
    
    // Check initial NFT stats (should be none)
    let block = chain.mineBlock([
      Tx.contractCall(
        "shooter-game",
        "get-nft-stats",
        [types.uint(1)],
        player.address
      )
    ]);
    
    block.receipts[0].result.expectNone();
    
    // Test level calculation
    block = chain.mineBlock([
      Tx.contractCall(
        "shooter-game",
        "calculate-level",
        [types.uint(150)],
        player.address
      )
    ]);
    
    block.receipts[0].result.expectOk().expectUint(1); // 150 exp = level 1
  }
});

Clarinet.test({
  name: "Player statistics tracking",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player = accounts.get("wallet_1")!;
    
    // Check initial player stats
    let block = chain.mineBlock([
      Tx.contractCall(
        "shooter-game",
        "get-player-stats",
        [types.principal(player.address)],
        player.address
      )
    ]);
    
    block.receipts[0].result.expectNone();
  }
});

Clarinet.test({
  name: "Reward system",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const player = accounts.get("wallet_1")!;
    
    // Test setting up reward (will fail without finalized session)
    let block = chain.mineBlock([
      Tx.contractCall(
        "shooter-game",
        "setup-reward",
        [
          types.uint(0), // session ID
          types.none(), // STX reward
          types.uint(1000000) // 1 STX
        ],
        deployer.address
      )
    ]);
    
    block.receipts[0].result.expectErr().expectUint(101); // err-session-not-found
  }
});

Clarinet.test({
  name: "Dispute system",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const player = accounts.get("wallet_1")!;
    
    // Test opening dispute (will fail without finalized session)
    let block = chain.mineBlock([
      Tx.contractCall(
        "shooter-game",
        "open-dispute",
        [
          types.uint(0), // session ID
          types.buff("0x7465737420726561736f6e") // "test reason"
        ],
        player.address
      )
    ]);
    
    block.receipts[0].result.expectErr().expectUint(101); // err-session-not-found
  }
});

Clarinet.test({
  name: "Game module registry",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    
    // Register a new game module
    let block = chain.mineBlock([
      Tx.contractCall(
        "shooter-game",
        "register-game-module",
        [
          types.uint(2), // module ID
          types.ascii("Strategy Game"),
          types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"),
          types.uint(0), // min score
          types.uint(10000) // max score
        ],
        deployer.address
      )
    ]);
    
    block.receipts[0].result.expectOk();
    
    // Check module registration
    block = chain.mineBlock([
      Tx.contractCall(
        "shooter-game",
        "get-game-module",
        [types.uint(2)],
        deployer.address
      )
    ]);
    
    const module = block.receipts[0].result.expectSome().expectTuple();
    module["name"].expectAscii("Strategy Game");
    module["enabled"].expectBool(true);
  }
});

Clarinet.test({
  name: "Replay protection",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const player = accounts.get("wallet_1")!;
    const resultHash = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    
    // Check if result hash is processed
    let block = chain.mineBlock([
      Tx.contractCall(
        "shooter-game",
        "is-result-processed",
        [types.buff(resultHash)],
        player.address
      )
    ]);
    
    block.receipts[0].result.expectOk().expectBool(false); // Not processed
  }
});

Clarinet.test({
  name: "Contract statistics",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    
    // Get contract statistics
    let block = chain.mineBlock([
      Tx.contractCall(
        "shooter-game",
        "get-contract-stats",
        [],
        deployer.address
      )
    ]);
    
    const stats = block.receipts[0].result.expectOk().expectTuple();
    stats["total-sessions"].expectUint(0);
    stats["total-games-played"].expectUint(0);
    stats["total-rewards-distributed"].expectUint(0);
  }
});

Clarinet.test({
  name: "Emergency functions",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const user = accounts.get("wallet_1")!;
    
    // Test emergency refund (non-owner should fail)
    let block = chain.mineBlock([
      Tx.contractCall(
        "shooter-game",
        "emergency-refund",
        [
          types.uint(0), // session ID
          types.principal(user.address),
          types.none(), // STX
          types.uint(1000000) // 1 STX
        ],
        user.address
      )
    ]);
    
    block.receipts[0].result.expectErr().expectUint(100); // err-unauthorised
  }
});

Clarinet.test({
  name: "Integration test - complete game flow",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get("deployer")!;
    const player = accounts.get("wallet_1")!;
    
    // 1. Set up trusted server
    const serverPubkey = "0x02a1633cafcc01ebfb6d78e39f687a1f0995c62fc95f51ead10a02ee0be551b5dc";
    chain.mineBlock([
      Tx.contractCall(
        "shooter-game", 
        "set-trusted-server", 
        [
          types.buff(serverPubkey),
          types.bool(true),
          types.ascii("Test Server")
        ], 
        deployer.address
      )
    ]);
    
    // 2. Start game session
    let block = chain.mineBlock([
      Tx.contractCall(
        "shooter-game",
        "start-session",
        [
          types.principal(player.address),
          types.some(types.uint(1))
        ],
        player.address
      )
    ]);
    
    const sessionId = block.receipts[0].result.expectOk().expectUint(0);
    
    // 3. Verify session is open
    block = chain.mineBlock([
      Tx.contractCall(
        "shooter-game",
        "get-session",
        [types.uint(sessionId)],
        player.address
      )
    ]);
    
    const session = block.receipts[0].result.expectSome().expectTuple();
    session["status"].expectAscii("open");
    session["player"].expectPrincipal(player.address);
    
    // 4. Check contract stats updated
    block = chain.mineBlock([
      Tx.contractCall(
        "shooter-game",
        "get-contract-stats",
        [],
        deployer.address
      )
    ]);
    
    const stats = block.receipts[0].result.expectOk().expectTuple();
    stats["total-sessions"].expectUint(1);
    stats["total-games-played"].expectUint(1);
  }
});

// Helper function to create proper test signatures (mock implementation)
function createMockSignature(messageHash: string, privateKey: string): string {
  // In a real implementation, this would use proper secp256k1 signing
  // For testing, we return a mock signature
  return "0x" + "a".repeat(128); // 64 bytes hex string
}

// Helper function to create message hash (mock implementation)
function createMessageHash(sessionId: number, score: number, exp: number): string {
  // In a real implementation, this would create a proper hash
  // For testing, we return a mock hash
  return "0x" + "b".repeat(64); // 32 bytes hex string
}