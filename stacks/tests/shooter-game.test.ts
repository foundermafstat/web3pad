import { describe, it, expect } from "vitest";
import { Cl } from "@stacks/transactions";

describe("Contract deployment and initialization", () => {
  it("should deploy contract successfully", async () => {
    const result = simnet.callReadOnlyFn(
      "shooter-game",
      "get-contract-stats",
      [],
      "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
    );
    
    const stats = result.result.value;
    expect(stats["total-sessions"]).toBeUint(0);
    expect(stats["total-games-played"]).toBeUint(0);
    expect(stats["total-rewards-distributed"]).toBeUint(0);
  });
});

describe("Trusted server management", () => {
  it("should set trusted server", async () => {
    const serverPubkey = "0x02a1633cafcc01ebfb6d78e39f687a1f0995c62fc95f51ead10a02ee0be551b5dc";
    
    const result = simnet.callPublicFn(
      "shooter-game", 
      "set-trusted-server", 
      [
        Cl.bufferFromHex(serverPubkey),
        Cl.bool(true),
        Cl.stringAscii("Test Server")
      ],
      "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
    );
    
    expect(result.result).toBeOk(Cl.bool(true));
  });

  it("should check if server is trusted", async () => {
    const serverPubkey = "0x02a1633cafcc01ebfb6d78e39f687a1f0995c62fc95f51ead10a02ee0be551b5dc";
    
    const result = simnet.callReadOnlyFn(
      "shooter-game",
      "is-trusted-server",
      [Cl.bufferFromHex(serverPubkey)],
      "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
    );
    
    expect(result.result).toBeBool(false);
  });

  it("should not allow non-owner to set trusted server", async () => {
    const serverPubkey = "0x02a1633cafcc01ebfb6d78e39f687a1f0995c62fc95f51ead10a02ee0be551b5dc";
    
    const result = simnet.callPublicFn(
      "shooter-game", 
      "set-trusted-server", 
      [
        Cl.bufferFromHex(serverPubkey),
        Cl.bool(true),
        Cl.stringAscii("Test Server")
      ],
      "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"
    );
    
    expect(result.result).toBeErr(Cl.uint(100)); // err-unauthorised
  });
});

describe("Game session lifecycle", () => {
  it("should start a game session", async () => {
    const result = simnet.callPublicFn(
      "shooter-game",
      "start-session",
      [
        Cl.standardPrincipal("ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"),
        Cl.some(Cl.uint(1)) // NFT token ID
      ],
      "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"
    );
    
    expect(result.result).toBeOk(Cl.uint(0)); // session ID 0
  });

  it("should get session details", async () => {
    // Start session first
    simnet.callPublicFn(
      "shooter-game",
      "start-session",
      [
        Cl.standardPrincipal("ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"),
        Cl.some(Cl.uint(1))
      ],
      "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"
    );
    
    const result = simnet.callReadOnlyFn(
      "shooter-game",
      "get-session",
      [Cl.uint(0)],
      "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"
    );
    
    const session = result.result.value;
    expect(session).toBeTuple({
      player: Cl.standardPrincipal("ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"),
      status: Cl.stringAscii("open")
    });
  });
});

describe("Game result reporting", () => {
  it("should fail with invalid signature", async () => {
    const serverPubkey = "0x02a1633cafcc01ebfb6d78e39f687a1f0995c62fc95f51ead10a02ee0be551b5dc";
    
    // Set up trusted server
    simnet.callPublicFn(
      "shooter-game", 
      "set-trusted-server", 
      [
        Cl.bufferFromHex(serverPubkey),
        Cl.bool(true),
        Cl.stringAscii("Test Server")
      ],
      "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
    );
    
    // Start session
    simnet.callPublicFn(
      "shooter-game",
      "start-session",
      [
        Cl.standardPrincipal("ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"),
        Cl.some(Cl.uint(1))
      ],
      "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"
    );
    
    // Create mock result hash and signature
    const resultHash = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    const signature = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    
    // Report result
    const result = simnet.callPublicFn(
      "shooter-game",
      "report-result",
      [
        Cl.uint(0), // session ID
        Cl.bufferFromHex(resultHash),
        Cl.bufferFromHex(signature),
        Cl.bufferFromHex(serverPubkey),
        Cl.uint(1500), // score
        Cl.uint(50), // exp gained
        Cl.none() // meta
      ],
      "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"
    );
    
    // Note: This will fail without proper signature, but tests the flow
    expect(result.result).toBeErr(Cl.uint(103)); // err-invalid-sig
  });
});

describe("NFT progression system", () => {
  it("should return none for initial NFT stats", async () => {
    const result = simnet.callReadOnlyFn(
      "shooter-game",
      "get-nft-stats",
      [Cl.uint(1)],
      "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"
    );
    
    expect(result.result).toBeNone();
  });

  it("should calculate level correctly", async () => {
    const result = simnet.callReadOnlyFn(
      "shooter-game",
      "calculate-level",
      [Cl.uint(150)],
      "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"
    );
    
    expect(result.result).toBeUint(1); // 150 exp = level 1
  });
});

describe("Player statistics tracking", () => {
  it("should return none for initial player stats", async () => {
    const result = simnet.callReadOnlyFn(
      "shooter-game",
      "get-player-stats",
      [Cl.standardPrincipal("ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG")],
      "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"
    );
    
    expect(result.result).toBeNone();
  });
});

describe("Reward system", () => {
  it("should fail to setup reward for non-existent session", async () => {
    const result = simnet.callPublicFn(
      "shooter-game",
      "setup-reward",
      [
        Cl.uint(0), // session ID
        Cl.none(), // STX reward
        Cl.uint(1000000) // 1 STX
      ],
      "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
    );
    
    expect(result.result).toBeErr(Cl.uint(101)); // err-session-not-found
  });
});

describe("Dispute system", () => {
  it("should fail to open dispute for non-existent session", async () => {
    const result = simnet.callPublicFn(
      "shooter-game",
      "open-dispute",
      [
        Cl.uint(0), // session ID
        Cl.bufferFromAscii("test reason")
      ],
      "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"
    );
    
    expect(result.result).toBeErr(Cl.uint(101)); // err-session-not-found
  });
});

describe("Game module registry", () => {
  it("should register a new game module", async () => {
    const result = simnet.callPublicFn(
      "shooter-game",
      "register-game-module",
      [
        Cl.uint(2), // module ID
        Cl.stringAscii("Strategy Game"),
        Cl.standardPrincipal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"),
        Cl.uint(0), // min score
        Cl.uint(10000) // max score
      ],
      "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
    );
    
    expect(result.result).toBeOk(Cl.bool(true));
  });

  it("should get registered game module", async () => {
    // Register module first
    simnet.callPublicFn(
      "shooter-game",
      "register-game-module",
      [
        Cl.uint(2),
        Cl.stringAscii("Strategy Game"),
        Cl.standardPrincipal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"),
        Cl.uint(0),
        Cl.uint(10000)
      ],
      "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
    );
    
    const result = simnet.callReadOnlyFn(
      "shooter-game",
      "get-game-module",
      [Cl.uint(2)],
      "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
    );
    
    const module = result.result.value;
    expect(module.name).toBeAscii("Strategy Game");
    expect(module.enabled).toBeBool(true);
  });
});

describe("Replay protection", () => {
  it("should return false for unprocessed result hash", async () => {
    const resultHash = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    
    const result = simnet.callReadOnlyFn(
      "shooter-game",
      "is-result-processed",
      [Cl.bufferFromHex(resultHash)],
      "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"
    );
    
    expect(result.result).toBeBool(false); // Not processed
  });
});

describe("Contract statistics", () => {
  it("should return initial contract stats", async () => {
    const result = simnet.callReadOnlyFn(
      "shooter-game",
      "get-contract-stats",
      [],
      "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
    );
    
    const stats = result.result.value;
    expect(stats["total-sessions"]).toBeUint(0);
    expect(stats["total-games-played"]).toBeUint(0);
    expect(stats["total-rewards-distributed"]).toBeUint(0);
  });
});

describe("Emergency functions", () => {
  it("should not allow non-owner to use emergency refund", async () => {
    const result = simnet.callPublicFn(
      "shooter-game",
      "emergency-refund",
      [
        Cl.uint(0), // session ID
        Cl.standardPrincipal("ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"),
        Cl.none(), // STX
        Cl.uint(1000000) // 1 STX
      ],
      "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"
    );
    
    expect(result.result).toBeErr(Cl.uint(100)); // err-unauthorised
  });
});

describe("Integration test - complete game flow", () => {
  it("should complete full game flow", async () => {
    const serverPubkey = "0x02a1633cafcc01ebfb6d78e39f687a1f0995c62fc95f51ead10a02ee0be551b5dc";
    
    // 1. Set up trusted server
    simnet.callPublicFn(
      "shooter-game", 
      "set-trusted-server", 
      [
        Cl.bufferFromHex(serverPubkey),
        Cl.bool(true),
        Cl.stringAscii("Test Server")
      ],
      "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
    );
    
    // 2. Start game session
    const startResult = simnet.callPublicFn(
      "shooter-game",
      "start-session",
      [
        Cl.standardPrincipal("ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"),
        Cl.some(Cl.uint(1))
      ],
      "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"
    );
    
    expect(startResult.result).toBeOk(Cl.uint(0));
    
    // 3. Verify session is open
    const sessionResult = simnet.callReadOnlyFn(
      "shooter-game",
      "get-session",
      [Cl.uint(0)],
      "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"
    );
    
    const session = sessionResult.result.value;
    expect(session.status).toBeAscii("open");
    expect(session.player).toBePrincipal("ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG");
    
    // 4. Check contract stats updated
    const statsResult = simnet.callReadOnlyFn(
      "shooter-game",
      "get-contract-stats",
      [],
      "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
    );
    
    const stats = statsResult.result.value;
    expect(stats["total-sessions"]).toBeUint(1);
    expect(stats["total-games-played"]).toBeUint(1);
  });
});