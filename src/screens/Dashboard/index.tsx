import React, { useState, useEffect, useCallback } from 'react'
import { ActivityIndicator } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { useTheme } from 'styled-components'
import { useAuth } from '../../hooks/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'

// components
import { HighlightCard } from '../../components/HighlightCard'
import {
  TransactionCard,
  TransactionCardProps,
} from '../../components/TransactionCard'

// styled-components
import {
  Container,
  Header,
  UserWrapper,
  UserInfo,
  Photo,
  User,
  UserGreeting,
  UserName,
  Icon,
  HighlightCards,
  Transactions,
  Title,
  TransactionList,
  LogoutButton,
  LoadContainer,
} from './styles'

export interface DataListProps extends TransactionCardProps {
  id: string
}

interface HighLightProps {
  amount: string
  lastTransaction: string
}
interface HighLightData {
  entries: HighLightProps
  expensive: HighLightProps
  total: HighLightProps
}

export function Dashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [transactions, setTransactions] = useState<DataListProps[]>([])
  const [highLightData, sethighLightData] = useState<HighLightData>(
    {} as HighLightData
    )
    
  const theme = useTheme()
  const { signOut, user } = useAuth()

  const dataKey = `@gofinance:transactions_user:${user.id}`

  function getLastTransactionDate(
    collection: DataListProps[],
    type: 'positive' | 'negative'
  ) {
    const collectionFiltered = collection.filter(transaction => transaction.type === type)

    if (collectionFiltered.length === 0) {
      return 0
    }

    const lastTransaction = Math.max.apply(
      Math,
      collectionFiltered
        .map(transaction => new Date(transaction.date).getTime())
    )

    return `${lastTransaction.getDate()} de ${lastTransaction.toLocaleString('pt-BR',{month: 'long'})}`
  }

  async function loadTransactions() {
    const response = await AsyncStorage.getItem(dataKey)
    const storagedTransactions = response ? JSON.parse(response) : []

    let entriesSumTotal = 0
    let expensiveTotal = 0


    const transactionFormatted: DataListProps[] = storagedTransactions.map(
      (item: DataListProps) => {
        if (item.type === "positive") {
          entriesSumTotal += Number(item.amount);
        } else {
          expensiveTotal += Number(item.amount);
        }

        const amount = Number(item.amount).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });
        const date = Intl.DateTimeFormat("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        }).format(new Date(item.date));

        return {
          id: item.id,
          name: item.name,
          amount,
          type: item.type,
          category: item.category,
          date,
        };
      }
    );

    setTransactions(transactionFormatted)
    const lastEntriesDate = getLastTransactionDate(transactions, 'positive')
    const lastExpensiveDate = getLastTransactionDate(transactions, 'negative')
    const totalInterval = lastExpensiveDate === 0 ? 'Não há transações suficientes' : `01 a ${lastExpensiveDate}`

    const totalPrice = entriesSumTotal - expensiveTotal
    sethighLightData({
      entries: {
        amount: entriesSumTotal.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
        lastTransaction: lastEntriesDate === 0 ? 'Não há transações' : `Última saída dia: ${lastEntriesDate}`,
      },
      expensive: {
        amount: expensiveTotal.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
        lastTransaction: lastExpensiveDate === 0 ? 'Não há transações' : `Última saída dia: ${lastExpensiveDate}`,
      },
      total: {
        amount: totalPrice.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
        lastTransaction: totalInterval
      },
    })

    setIsLoading(false)
  }

  useEffect(() => {
    loadTransactions();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTransactions()
    }, [])
  )

  return (
    <Container>
      {isLoading ? (
        <LoadContainer>
          <ActivityIndicator color={theme.colors.primary} size='large' />
        </LoadContainer>
      ) : (
        <>
          <Header>
            <UserWrapper>
              <UserInfo>
                <Photo
                  source={{
                    uri: user.photo,
                  }}
                />

                <User>
                  <UserGreeting>Olá, </UserGreeting>
                  <UserName>{user.name}</UserName>
                </User>
              </UserInfo>

              <LogoutButton onPress={signOut}>
                <Icon name='power' />
              </LogoutButton>
            </UserWrapper>
          </Header>

          <HighlightCards>
            <HighlightCard
              type='up'
              title='Entradas'
              amount={highLightData.entries.amount}
              lastTransaction={`Última entrada dia ${highLightData.entries.lastTransaction}`} 
            />
            <HighlightCard
              type='down'
              title='Saídas'
              amount={highLightData.expensive.amount}
              lastTransaction={`Última saída dia ${highLightData.expensive.lastTransaction}`} 
            />
            <HighlightCard
              type='total'
              title='Total'
              amount={highLightData.total.amount}
              lastTransaction={`De 01 à ${highLightData.total.lastTransaction}`}
            />
          </HighlightCards>

          <Transactions>
            <Title>Listagem</Title>

            <TransactionList
              data={transactions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <TransactionCard data={item} />}
            />
          </Transactions>
        </>
      )}
    </Container>
  )
}
