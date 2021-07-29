import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Linking } from 'react-native';
import { magic, web3 } from './magic';
import { abi } from './contract/abi.js';

export default function App() {
  // User
  const [email, setEmail] = useState('');
  const [user, setUser] = useState('');
  const [balance, setBalance] = useState('...');

  // Send Transaction
  const [toAddress, setToAddress] = useState('0x16175723303661Cf3eC1f4A87A0E5434095e8F5f');
  const [amount, setAmount] = useState('');
  const [sendTxnBtnDisabled, setSendTxnBtnDisabled] = useState(false);
  const [sendTxnBtnText ,setSendTxnBtnText] = useState('Send');
  const [sendTxnHash, setSendTxnHash] = useState('');

  // Update Smart Contract Message
  const contractAddress = '0x1e1bF128A09fD30420CE9fc294C4266C032eF6E7'; // https://alfajores-blockscout.celo-testnet.org/address/0x1e1bF128A09fD30420CE9fc294C4266C032eF6E7/transactions
  const contract = new web3.eth.Contract(abi, contractAddress);
  const [message, setMessage] = useState('...');
  const [newMessage, setNewMessage] = useState('');
  const [updateContractBtnText, setUpdateContractBtnText] = useState('Update');
  const [updateContractBtnDisabled, setUpdateContractBtnDisabled] = useState(false);
  const [updateContractTxnHash, setUpdateContractTxnHash] = useState('');

  // If user is logged in, fetch user wallet balance and the `message` variable from the smart contract
  useEffect(() => {
    magic.user.isLoggedIn().then(isLoggedIn => {
      if (!isLoggedIn) return setUser('');
      magic.user.getMetadata().then(user => {
        setUser(user);
        fetchBalance(user.publicAddress);
        fetchContractMessage();
      });
    })
  }, [])

  // Trigger magic link for user to login / generate wallet
  const login = async () => {
    try {
      await magic.auth.loginWithMagicLink({ email });
      magic.user.getMetadata().then(setUser);
    } catch(err) {
      alert(err);
    }
  };

  // const loginWithGoogle = async () => {
  //   const res = await magic.oauth.loginWithPopup({ provider: 'google', redirectURI: 'exp://' });
  // }

  // Logout of Magic session
  const logout = async () => {
    await magic.user.logout();
    setUser('');
  };

  // Fetch logged in user's Celo balance
  const fetchBalance = (address) => {
    web3.eth.getBalance(address).then(bal => setBalance(web3.utils.fromWei(bal)))
  }

  // Submit a transaction to Celo network
  const sendTransaction = async () => {
    try {
    disableSendTxnForm();
    const { transactionHash } = await web3.eth.sendTransaction({
      from: user.publicAddress,
      to: toAddress,
      value: web3.utils.toWei(amount)
    });
    setSendTxnHash(transactionHash);
    enableSendTxnForm();
    fetchBalance();
  } catch (err) {
    enableSendTxnForm();
    alert (err)
  }
  }

  const disableSendTxnForm = () => {
    setSendTxnHash('');
    setSendTxnBtnDisabled(true);
    setSendTxnBtnText('Pending...');
  }

  const enableSendTxnForm = () => {
    setToAddress('');
    setAmount('');
    setSendTxnBtnText('Send');
    setSendTxnBtnDisabled(false);
  }

  const fetchContractMessage = () => contract.methods.message().call().then(setMessage);

  const updateContractMessage = async () => {
    try {
    disableUpdateContractForm()
    let { transactionHash } = await contract.methods.update(newMessage).send({ from: user.publicAddress });
    alert(transactionHash);
    setUpdateContractTxnHash(transactionHash);
    enableUpdateContractForm();
    fetchContractMessage();
    fetchBalance();
    } catch (err) {
      enableUpdateContractForm();
      alert(err);
    }
  }

  const disableUpdateContractForm = () => {
    setUpdateContractTxnHash('');
    setUpdateContractBtnDisabled(true);
    setUpdateContractBtnText('Pending...');
  }

  const enableUpdateContractForm = () => {
    setNewMessage('');
    setUpdateContractBtnDisabled(false);
    setUpdateContractBtnText('Update');
  }


  return (
    <View style={styles.container}>
      {!user ? 
      <View>
      <Text>Login or Signup</Text>
      <TextInput
        style={styles.input}
        onChangeText={text => setEmail(text)}
        value={email}
        placeholder='Enter your email'
      />
      <View>
        <Button style={styles.button} onPress={() => login()}  title="Login" />
      </View>
      </View> :
      <View>
        {/* USER */}
        <View style={styles.view}>
          <Text>{user.email}</Text>
          <Button style={styles.button} onPress={() => logout()}  title="Logout" />
        </View>

        {/* INFO */}
        <View style={styles.view}>
          <Text style={styles.heading}>Network</Text>
          <Text style={styles.info}>CELO Ajfajores</Text>

          <Text style={styles.heading}>Public Address</Text>
          <Text style={styles.info}>{user.publicAddress}</Text>

          <Text style={styles.heading}>Balance</Text>
          <Text style={styles.info}>{balance} CELO</Text>

          <Text onPress={() => Linking.openURL('https://celo.org/developers/faucet')}>Get Test Celo ↗️</Text>
        </View>

        {/* SEND TRANSACTION */}
        <View style={styles.view}>
          <Text style={styles.heading}>Send Transaction</Text>
          <TextInput style={styles.input} value={toAddress} onChangeText={text => setToAddress(text)} placeholder="To..."></TextInput>
          <TextInput style={styles.input} value={amount} onChangeText={text => setAmount(text)} placeholder="Amount..."></TextInput>
          <Button style={styles.button} onPress={() => sendTransaction()}  title={sendTxnBtnText} disabled={sendTxnBtnDisabled} />
          <Text>{sendTxnHash && <Text onPress={() => Linking.openURL(`https://alfajores-blockscout.celo-testnet.org/tx/${sendTxnHash}`)}>View Transaction ↗️</Text>}</Text>
        </View>

        {/* SMART CONTRACT */}
        <View style={styles.view}>
          <Text style={styles.heading}>Contract Message</Text>
          <Text style={styles.info}>{message}</Text>
          <Text style={styles.heading}>Update Message</Text>
          <TextInput style={styles.input} value={newMessage} onChangeText={text => setNewMessage(text)} placeholder="New Message"></TextInput>
          <Button style={styles.button} onPress={() => updateContractMessage()}  title={updateContractBtnText} disabled={updateContractBtnDisabled} />
          <Text>{updateContractTxnHash && <Text onPress={() => Linking.openURL(`https://alfajores-blockscout.celo-testnet.org/tx/${updateContractTxnHash}`)}>View Transaction ↗️</Text>}</Text>
        </View>
      </View> }

      {/* <Card>
        <Card.Title>Google Login</Card.Title>
        <View>
          <Button onPress={() => loginWithGoogle()}  title="Login" />
        </View>
      </Card> */}
      <StatusBar style="auto" />
      <magic.Relayer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: "scroll"
  },
  view: {
    backgroundColor: "#eee",
    padding: 25,
    marginTop: 15,
  },
  heading: {
    fontSize: 20
  },
  info: {
    fontFamily: 'Courier',
    backgroundColor: '#ddd',
    padding: 10,
    marginTop: 10,
    marginBottom: 15,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 20,
    backgroundColor: '#fff',
    color: '#000',
  },
  button: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 20,
    borderRadius: 1,
    borderColor: '#000'
  }
});
