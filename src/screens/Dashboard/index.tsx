import React, { useState, useEffect, useCallback } from 'react'
import { ActivityIndicator } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { useTheme } from 'styled-components'
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

  function getLastTransactionDate(
    collection: DataListProps[],
    type: 'positive' | 'negative'
  ) {
    const lastTransaction = Math.max.apply(
      Math,
      collection
        .filter(transaction => transaction.type === type)
        .map(transaction => new Date(transaction.date).getTime())
    )

    return Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
    }).format(new Date(lastTransaction))
  }

  async function loadTransactions() {
    const transactionsKey = '@gofinance:transactions'
    const response = await AsyncStorage.getItem(transactionsKey)

    let entriesTotal = 0
    let expensiveTotal = 0

    const transactions = response ? JSON.parse(response) : []

    const transactionsFormatted: DataListProps[] = transactions.map(
      (item): DataListProps => {
        if (item.type === 'positive') {
          entriesTotal += Number(item.amount)
        } else {
          expensiveTotal += Number(item.amount)
        }

        const amount = Number(item.amount).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        })
        const date = Intl.DateTimeFormat('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit',
        }).format(new Date(item.date))

        return {
          id: item.id,
          name: item.name,
          amount,
          type: item.type,
          category: item.category,
          date,
        }
      }
    )


    const lastEntriesDate = getLastTransactionDate(transactions, 'positive')
    const lastExpensiveDate = getLastTransactionDate(transactions, 'positive')

    const totalPrice = entriesTotal - expensiveTotal
    sethighLightData({
      entries: {
        amount: entriesTotal.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
        lastTransaction: lastEntriesDate,
      },
      expensive: {
        amount: expensiveTotal.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
        lastTransaction: lastExpensiveDate,
      },
      total: {
        amount: totalPrice.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
        lastTransaction: lastExpensiveDate
      },
    })


    setTransactions(transactionsFormatted)
    setIsLoading(false)
  }

  useEffect(() => {
    loadTransactions()
  }, [])

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
                    uri: 'https://avatars.githubusercontent.com/u/29352554?v=4',
                  }}
                />

                <User>
                  <UserGreeting>Olá, </UserGreeting>
                  <UserName>Pedro</UserName>
                </User>
              </UserInfo>

              <LogoutButton onPress={() => {}}>
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
