import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.7.1/index.ts';

Clarinet.test({
  name: 'Shooter Game - Basic functionality tests',
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;

    // Test contract initialization
    let result = chain.callReadOnlyFn(
      'shooter-game',
      'get-contract-stats',
      [],
      deployer.address
    );
    
    const stats = result.result.expectOk().expectTuple();
    stats['total-sessions'].expectUint(0);
    stats['total-games-played'].expectUint(0);

    // Test trusted server registration
    const serverPubkey = types.buff(new Uint8Array(33).fill(1));
    result = chain.mineBlock([
      Tx.contractCall(
        'shooter-game',
        'set-trusted-server',
        [
          serverPubkey,
          types.bool(true),
          types.ascii('Test Server')
        ],
        deployer.address
      )
    ]);

    result.receipts[0].result.expectOk().expectBool(true);

    // Verify server was registered
    result = chain.callReadOnlyFn(
      'shooter-game',
      'get-trusted-server',
      [serverPubkey],
      deployer.address
    );
    
    const server = result.result.expectSome().expectTuple();
    server['enabled'].expectBool(true);
    server['server-name'].expectAscii('Test Server');

    // Test game session start
    result = chain.mineBlock([
      Tx.contractCall(
        'shooter-game',
        'start-session',
        [
          types.principal(wallet1.address),
          types.some(types.uint(1))
        ],
        wallet1.address
      )
    ]);

    result.receipts[0].result.expectOk().expectUint(0);

    // Verify session was created
    result = chain.callReadOnlyFn(
      'shooter-game',
      'get-session',
      [types.uint(0)],
      deployer.address
    );
    
    const session = result.result.expectSome().expectTuple();
    session['player'].expectPrincipal(wallet1.address);
    session['status'].expectAscii('open');
    session['nft-token-id'].expectSome().expectUint(1);

    // Test game result reporting
    const resultHash = types.buff(new Uint8Array(32).fill(2));
    const signature = types.buff(new Uint8Array(64).fill(3));
    
    result = chain.mineBlock([
      Tx.contractCall(
        'shooter-game',
        'report-result',
        [
          types.uint(0),
          resultHash,
          signature,
          serverPubkey,
          types.uint(1500),
          types.uint(50),
          types.none()
        ],
        wallet1.address
      )
    ]);

    // Note: This will fail due to signature verification, but we can test the flow
    result.receipts[0].result.expectErr(); // Should fail due to invalid signature

    // Test player stats initialization
    result = chain.callReadOnlyFn(
      'shooter-game',
      'get-player-stats',
      [types.principal(wallet1.address)],
      deployer.address
    );
    
    result.result.expectNone(); // No stats yet since result reporting failed

    // Test NFT stats initialization
    result = chain.callReadOnlyFn(
      'shooter-game',
      'get-nft-stats',
      [types.uint(1)],
      deployer.address
    );
    
    result.result.expectNone(); // No stats yet since result reporting failed
  }
});

Clarinet.test({
  name: 'Shooter Game - Access control tests',
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;

    // Test unauthorized server registration
    const serverPubkey = types.buff(new Uint8Array(33).fill(1));
    let result = chain.mineBlock([
      Tx.contractCall(
        'shooter-game',
        'set-trusted-server',
        [
          serverPubkey,
          types.bool(true),
          types.ascii('Unauthorized Server')
        ],
        wallet1.address
      )
    ]);

    result.receipts[0].result.expectErr().expectUint(100); // err-unauthorised

    // Test unauthorized game module registration
    result = chain.mineBlock([
      Tx.contractCall(
        'shooter-game',
        'register-game-module',
        [
          types.uint(1),
          types.ascii('Unauthorized Module'),
          types.principal(wallet1.address),
          types.uint(0),
          types.uint(1000)
        ],
        wallet1.address
      )
    ]);

    result.receipts[0].result.expectErr().expectUint(100); // err-unauthorised

    // Test unauthorized reward setup
    result = chain.mineBlock([
      Tx.contractCall(
        'shooter-game',
        'setup-reward',
        [
          types.uint(0),
          types.none(),
          types.uint(1000)
        ],
        wallet1.address
      )
    ]);

    result.receipts[0].result.expectErr().expectUint(100); // err-unauthorised
  }
});

Clarinet.test({
  name: 'Shooter Game - Error handling tests',
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;

    // Test starting session for non-existent player
    let result = chain.mineBlock([
      Tx.contractCall(
        'shooter-game',
        'start-session',
        [
          types.principal(wallet1.address),
          types.none()
        ],
        wallet1.address
      )
    ]);

    result.receipts[0].result.expectOk().expectUint(0);

    // Test reporting result for non-existent session
    const resultHash = types.buff(new Uint8Array(32).fill(2));
    const signature = types.buff(new Uint8Array(64).fill(3));
    const serverPubkey = types.buff(new Uint8Array(33).fill(1));
    
    result = chain.mineBlock([
      Tx.contractCall(
        'shooter-game',
        'report-result',
        [
          types.uint(999), // Non-existent session
          resultHash,
          signature,
          serverPubkey,
          types.uint(1500),
          types.uint(50),
          types.none()
        ],
        wallet1.address
      )
    ]);

    result.receipts[0].result.expectErr().expectUint(101); // err-session-not-found

    // Test reporting result by wrong player
    result = chain.mineBlock([
      Tx.contractCall(
        'shooter-game',
        'report-result',
        [
          types.uint(0),
          resultHash,
          signature,
          serverPubkey,
          types.uint(1500),
          types.uint(50),
          types.none()
        ],
        wallet2.address // Wrong player
      )
    ]);

    result.receipts[0].result.expectErr().expectUint(100); // err-unauthorised

    // Test claiming reward for non-existent session
    result = chain.mineBlock([
      Tx.contractCall(
        'shooter-game',
        'claim-reward',
        [types.uint(999)],
        wallet1.address
      )
    ]);

    result.receipts[0].result.expectErr().expectUint(101); // err-session-not-found

    // Test opening dispute for non-existent session
    const reason = types.buff(new Uint8Array(16).fill(4));
    result = chain.mineBlock([
      Tx.contractCall(
        'shooter-game',
        'open-dispute',
        [
          types.uint(999),
          reason
        ],
        wallet1.address
      )
    ]);

    result.receipts[0].result.expectErr().expectUint(101); // err-session-not-found
  }
});

Clarinet.test({
  name: 'Shooter Game - Game module registration tests',
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;

    // Test registering a game module
    let result = chain.mineBlock([
      Tx.contractCall(
        'shooter-game',
        'register-game-module',
        [
          types.uint(1),
          types.ascii('Racing Game'),
          types.principal(deployer.address),
          types.uint(0),
          types.uint(2000)
        ],
        deployer.address
      )
    ]);

    result.receipts[0].result.expectOk().expectBool(true);

    // Verify module was registered
    result = chain.callReadOnlyFn(
      'shooter-game',
      'get-game-module',
      [types.uint(1)],
      deployer.address
    );
    
    const module = result.result.expectSome().expectTuple();
    module['name'].expectAscii('Racing Game');
    module['enabled'].expectBool(true);
    module['min-score'].expectUint(0);
    module['max-score'].expectUint(2000);

    // Test registering duplicate module ID
    result = chain.mineBlock([
      Tx.contractCall(
        'shooter-game',
        'register-game-module',
        [
          types.uint(1), // Same ID
          types.ascii('Duplicate Game'),
          types.principal(deployer.address),
          types.uint(0),
          types.uint(1000)
        ],
        deployer.address
      )
    ]);

    result.receipts[0].result.expectOk().expectBool(true); // Should overwrite
  }
});

Clarinet.test({
  name: 'Shooter Game - Dispute system tests',
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;

    // Test dispute functionality (without actual finalized session)
    const reason = types.buff(new Uint8Array(16).fill(4));
    
    let result = chain.mineBlock([
      Tx.contractCall(
        'shooter-game',
        'open-dispute',
        [
          types.uint(0),
          reason
        ],
        wallet1.address
      )
    ]);

    // Should fail because session is not finalized
    result.receipts[0].result.expectErr().expectUint(102); // err-session-closed

    // Test dispute resolution (unauthorized)
    result = chain.mineBlock([
      Tx.contractCall(
        'shooter-game',
        'resolve-dispute',
        [
          types.uint(0),
          types.bool(true)
        ],
        wallet1.address
      )
    ]);

    result.receipts[0].result.expectErr().expectUint(100); // err-unauthorised

    // Test authorized dispute resolution
    result = chain.mineBlock([
      Tx.contractCall(
        'shooter-game',
        'resolve-dispute',
        [
          types.uint(0),
          types.bool(true)
        ],
        deployer.address
      )
    ]);

    result.receipts[0].result.expectErr().expectUint(204); // err-invalid-params (no dispute exists)
  }
});
