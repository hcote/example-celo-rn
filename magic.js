import { Magic } from '@magic-sdk/react-native';
import Web3 from 'web3';

export const magic = new Magic('pk_test_C14E63531D0A7D2F', {
  network: {
    rpcUrl: 'https://alfajores-forno.celo-testnet.org'
  }
});

export const web3 = new Web3(magic.rpcProvider);