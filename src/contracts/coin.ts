import { readKeyset } from '@kadena/client';
import { genKeyPair } from '@kadena/cryptography-utils';
import { PactToolboxClient } from '../client';
import { Signer } from '../config';
import { getAccountKey, pactDecimal } from '../utils';

type CoinAccount = Signer;
interface CoinAccountDetails {
  balance: string;
  account: string;
}

export class CoinContract {
  constructor(private client: PactToolboxClient) {}

  async getBalance(account: string) {
    return this.client.dirtyRead(this.client.execution(`(coin.get-balance "${account}")`).createTransaction());
  }

  async transfer(from: CoinAccount, to: string | CoinAccount, amount: number) {
    const recipient = typeof to === 'string' ? to : to.account;
    const tx = this.client
      .execution(`(coin.transfer "${from.account}" "${recipient}" ${pactDecimal(amount)})`)
      .setMeta({ senderAccount: from.account })
      .addSigner(from.publicKey, (signFor) => [
        signFor('coin.GAS'),
        signFor('coin.TRANSFER', from, to, pactDecimal(amount)),
      ])
      .createTransaction();

    const signedTx = await this.client.sign(tx, from);
    return this.client.submitAndListen(signedTx);
  }

  async transferCreate(from: CoinAccount, to: CoinAccount, amount: number) {
    const tx = this.client
      .execution(`(coin.transfer-create "${from}" "${to}" ${readKeyset('toKs')} ${pactDecimal(amount)})`)
      .setMeta({ senderAccount: from.account })
      .addKeyset('toKs', 'key-all', from.publicKey)
      .addSigner(from.publicKey, (signFor) => [
        signFor('coin.GAS'),
        signFor('coin.TRANSFER', from, to, pactDecimal(amount)),
      ])
      .createTransaction();
    const signedTx = await this.client.sign(tx, from);
    return this.client.submitAndListen(signedTx);
  }

  async createAccount() {
    const keys = genKeyPair();
    const account = `${keys.publicKey}`;
    const tx = this.client
      .execution(`(coin.create-account "${account}" (read-keyset 'ks))`)
      .setMeta({ senderAccount: account })
      .addKeyset('ks', 'key-all', keys.publicKey)
      .addSigner(keys.publicKey)
      .createTransaction();
    const signedTx = await this.client.sign(tx, keys);
    await this.client.submitAndListen(signedTx);
    return {
      ...keys,
      account,
    };
  }

  async details(account: string) {
    return this.client.dirtyRead<CoinAccountDetails>(
      this.client.execution(`(coin.details "${account}")`).createTransaction(),
    );
  }

  async accountExists(account: string) {
    console.log('Checking if account exists...', account);

    try {
      const acc = await this.details(account);
      if (acc) {
        return true;
      }
    } catch (e: unknown) {
      console.error((e as Error).message);
      return false;
    }
  }

  async fund(recipient: string | CoinAccount, amount: number, preflight = false) {
    const fundingAccount = this.client.getSigner();
    const r =
      typeof recipient === 'string'
        ? { account: recipient, publicKey: getAccountKey(recipient), secretKey: '' }
        : recipient;
    // check if the account exists
    const accountFound = await this.accountExists(r.publicKey);
    if (accountFound) {
      await this.transfer(fundingAccount, recipient, amount);
    } else {
      await this.transferCreate(fundingAccount, r, amount);
    }
  }
}
