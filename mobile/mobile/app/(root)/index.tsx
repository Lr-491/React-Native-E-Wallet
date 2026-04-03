import { styles } from '@/assets/styles/home.styles';
import BalanceCard from '@/components/BalanceCard';
import PageLoader from '@/components/PageLoader';
import { SignOutButton } from '@/components/SignOutButton'
import useTransactions from '@/hooks/useTransactions';
import { Show, useSession, useUser } from '@clerk/expo'
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router'
import { useEffect } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export default function Page() {
  const { user } = useUser();
  const { session } = useSession();
  const router = useRouter();
  console.log("New Session",session?.currentTask);
  console.log("userid",user?.id);

  const { transactions, summary, isLoading, loadData, deleteTransaction} = useTransactions(user?.id);

  useEffect(() => {
    loadData();
  },[loadData]);

  console.log("transaction :", transactions);
  console.log("summary :", summary);
  
  if (isLoading) return <PageLoader />
  
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* HEADER */}
        <View style={styles.header}>
          {/* LEFT */}
          <View style={styles.headerLeft}>
            <Image 
            source={require("../../assets/images/logo.png")}
            style={styles.headerLogo}
            resizeMode='contain'
            />
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeText}>Welcome,</Text>
              <Text style={styles.usernameText}>
                {user?.emailAddresses[0]?.emailAddress.split('@')[0]}
              </Text>
            </View>
          </View>
          {/* RIGHT */}
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.addButton} onPress={() =>router.push('/create')}>
              <Ionicons name='add' size={20} color="#FFF" />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
            <SignOutButton />
          </View>
        </View>

        {/* BALANCE CARD */}
        <BalanceCard summary={summary} />

        {/* Recent transactions */}
        <View style={styles.transactionsHeaderContainer}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
        </View>
      </View>
    </View>
  )
}
