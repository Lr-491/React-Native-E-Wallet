import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '@/assets/styles/home.styles';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { formatDate } from '@/lib/utils';

// Importe le type Transaction depuis le hook pour éviter la duplication
import { Transaction } from '@/hooks/useTransactions';

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

// Type pour les icônes Ionicons par catégorie
type CategoryIconMap = {
  [key: string]: string;
};

// Props du composant
interface TransactionItemProps {
  item: Transaction;
  onDelete: (id: number) => void;
}

// ─────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────

// Correspondance entre catégorie et icône Ionicons
const CATEGORY_ICONS: CategoryIconMap = {
  "Food & Drinks": "fast-food",
  Shopping: "cart",
  Transportation: "car",
  Entertainment: "film",      
  Bills: "receipt",           
  Income: "cash",
  Other: "ellipsis-horizontal", 
};

// ─────────────────────────────────────────────
// COMPOSANT
// ─────────────────────────────────────────────

const TransactionItem = ({ item, onDelete }: TransactionItemProps) => {
  const isIncome = parseFloat(String(item.amount)) > 0;
  const iconName = CATEGORY_ICONS[item.category] || "pricetag-outline"; 

  return (
    <View style={styles.transactionCard}>
      <TouchableOpacity style={styles.transactionContent}>

        {/* Icône de la catégorie */}
        <View style={styles.categoryIconContainer}>
          <Ionicons
            name={iconName as any}
            size={22}
            color={isIncome ? COLORS.income : COLORS.expense}
          />
        </View>

        {/* Partie gauche : titre + catégorie */}
        <View style={styles.transactionLeft}>
          <Text style={styles.transactionTitle}>{item.title}</Text>
          <Text style={styles.transactionCategory}>{item.category}</Text>
        </View>

        {/* Partie droite : montant + date */}
        <View style={styles.transactionRight}>
          <Text style={[styles.transactionAmount, { color: isIncome ? COLORS.income : COLORS.expense }]}>
            {isIncome ? "+" : "-"}${Math.abs(parseFloat(String(item.amount))).toFixed(2)}
          </Text>
          <Text style={styles.transactionDate}>{formatDate(item.created_at)}</Text>
        </View>

      </TouchableOpacity>

      {/* Bouton de suppression */}
      <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(item.id)}>
        <Ionicons name="trash-outline" size={20} color={COLORS.expense} />
      </TouchableOpacity>
    </View>
  );
};

export default TransactionItem;