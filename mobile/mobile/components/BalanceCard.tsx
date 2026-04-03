import { View, Text } from 'react-native';
import React from 'react';
import { styles } from '@/assets/styles/home.styles';
import { COLORS } from '@/constants/colors';
import { Summary } from '@/hooks/useTransactions';

// ─────────────────────────────────────────────
// TYPE
// ─────────────────────────────────────────────

// Props du composant
interface BalanceCardProps {
  summary: Summary;
}

// ─────────────────────────────────────────────
// COMPOSANT
// ─────────────────────────────────────────────

const BalanceCard = ({ summary }: BalanceCardProps) => {
  return (
    <View style={styles.balanceCard}>
      <Text style={styles.balanceTitle}>Total Balance</Text>
      <Text style={styles.balanceAmount}>
        ${parseFloat(summary.balance).toFixed(2)}
      </Text>

      <View style={styles.balanceStats}>
        {/* Revenus */}
        <View style={styles.balanceStatItem}>
          <Text style={styles.balanceStatLabel}>Income</Text>
          <Text style={[styles.balanceStatAmount, { color: COLORS.income }]}>
            +${parseFloat(summary.income).toFixed(2)}
          </Text>
        </View>

        {/* Séparateur visuel */}
        <View style={[styles.balanceStatItem, styles.statDivider]} />

        {/* Dépenses */}
        <View style={styles.balanceStatItem}>
          <Text style={styles.balanceStatLabel}>Expenses</Text>
          <Text style={[styles.balanceStatAmount, { color: COLORS.expense }]}>
            -${Math.abs(parseFloat(summary.expenses)).toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  )
}

export default BalanceCard