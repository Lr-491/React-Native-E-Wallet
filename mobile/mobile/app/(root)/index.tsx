import { SignOutButton } from '@/components/SignOutButton'
import useTransactions from '@/hooks/useTransactions';
import { Show, useSession, useUser } from '@clerk/expo'
import { Link } from 'expo-router'
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native'

export default function Page() {
  const { user } = useUser();
  const { session } = useSession();
  console.log("New Session",session?.currentTask);
  console.log("userid",user?.id);

  const { transactions, summary, isLoading, loadData, deleteTransaction} = useTransactions(user?.id);

  useEffect(() => {
    loadData();
  },[loadData]);

  console.log("transaction :", transactions);
  console.log("summary :", summary);
  
  return (
    <View style={styles.container}>
      <Text>Welcome!</Text>
      <Show when="signed-out">
        <Link href="/(auth)/sign-in">
          <Text>Sign in</Text>
        </Link>
        <Link href="/(auth)/sign-up">
          <Text>Sign up</Text>
        </Link>
      </Show>
      <Show when="signed-in">
        <Text>Hello {user?.emailAddresses[0].emailAddress}</Text>
        <SignOutButton />
      </Show>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
})