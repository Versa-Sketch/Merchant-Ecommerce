import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { router } from 'expo-router';
import { Colors } from '../../theme/colors';
import { Shadows } from '../../theme/shadows';
import { Button } from '../../components/ui/Button';
import { BottomSheet } from '../../components/bottomSheets/BottomSheet';
import {
  ArrowLeft,
  MessageSquare,
  LifeBuoy,
  CheckCircle,
  HelpCircle,
  Clock,
  Send,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface ChatMessage {
  sender: 'customer' | 'merchant' | 'support' | 'system';
  text: string;
}

interface SupportTicket {
  id: string;
  category: string;
  customer: string;
  date: string;
  status: 'Open' | 'Resolved';
  messages: ChatMessage[];
}

export const SupportScreen = observer(() => {
  const insets = useSafeAreaInsets();
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [ticketReply, setTicketReply] = useState('');
  
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: 'T-4091',
      category: 'Wrong Product',
      customer: 'Meera Nair',
      date: '3 hrs ago',
      status: 'Open',
      messages: [
        { sender: 'customer', text: 'Hey, I received Crocin pain relief instead of Crocin cold!' },
        { sender: 'system', text: 'Ticket registered. Merchant assigned.' },
      ],
    },
    {
      id: 'T-4089',
      category: 'Refund',
      customer: 'Suresh Kumar',
      date: 'Yesterday',
      status: 'Resolved',
      messages: [
        { sender: 'customer', text: 'Order was cancelled, where is my refund?' },
        { sender: 'support', text: 'Refund of ₹80 processed to your source account.' },
      ],
    },
  ]);

  const submitTicketMessage = () => {
    if (!selectedTicketId || !ticketReply.trim()) return;
    
    setTickets(
      tickets.map((t) =>
        t.id === selectedTicketId
          ? {
              ...t,
              messages: [...t.messages, { sender: 'merchant', text: ticketReply.trim() }],
            }
          : t
      )
    );
    setTicketReply('');
    Alert.alert('Message Sent', 'Your response has been sent to customer support.');
  };

  const handleResolveTicket = (id: string) => {
    setTickets(
      tickets.map((t) =>
        t.id === id
          ? {
              ...t,
              status: 'Resolved' as const,
              messages: [...t.messages, { sender: 'system', text: 'Ticket has been marked as RESOLVED by the merchant.' }],
            }
          : t
      )
    );
    Alert.alert('Ticket Resolved', 'The support ticket has been closed.');
  };

  const activeTicket = tickets.find((t) => t.id === selectedTicketId);

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeft color={Colors.textPrimary} size={22} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>Customer Support Desk</Text>
          <Text style={styles.subtitle}>Manage wrong shipments, refunds & support tickets</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Support Stats Banner */}
        <View style={styles.statsBanner}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>OPEN TICKETS</Text>
            <Text style={[styles.statVal, { color: Colors.warning }]}>
              {tickets.filter((t) => t.status === 'Open').length}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>AVG RESOLUTION</Text>
            <Text style={[styles.statVal, { color: Colors.primary }]}>14 mins</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>RESOLVED TODAY</Text>
            <Text style={[styles.statVal, { color: Colors.success }]}>
              {tickets.filter((t) => t.status === 'Resolved').length}
            </Text>
          </View>
        </View>

        {/* Tickets Directory */}
        <Text style={styles.directoryHeader}>Support Directory</Text>
        
        <View style={styles.ticketsList}>
          {tickets.map((t) => (
            <View key={t.id} style={styles.ticketCard}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <View style={styles.row}>
                  <Text style={styles.ticketCat}>{t.category} Ticket</Text>
                  <View style={[
                    styles.statusBadge, 
                    { backgroundColor: t.status === 'Open' ? 'rgba(242, 169, 59, 0.08)' : 'rgba(34, 181, 115, 0.08)' }
                  ]}>
                    <Text style={[
                      styles.statusText, 
                      { color: t.status === 'Open' ? Colors.warning : Colors.success }
                    ]}>
                      {t.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.ticketId}>ID: #{t.id}</Text>
                <Text style={styles.ticketCustomer}>Filed by: {t.customer} • {t.date}</Text>
              </View>

              <View style={styles.actionBlock}>
                <TouchableOpacity
                  style={[styles.chatBtn, t.status !== 'Open' && { borderColor: Colors.border }]}
                  onPress={() => setSelectedTicketId(t.id)}
                >
                  <MessageSquare size={14} color={t.status === 'Open' ? Colors.primary : Colors.textSecondary} />
                  <Text style={[styles.chatBtnText, { color: t.status === 'Open' ? Colors.primary : Colors.textSecondary }]}>
                    Chat
                  </Text>
                </TouchableOpacity>

                {t.status === 'Open' && (
                  <TouchableOpacity
                    style={styles.resolveLink}
                    onPress={() => handleResolveTicket(t.id)}
                  >
                    <Text style={styles.resolveLinkText}>Resolve</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Support Chat Bottom Sheet */}
      <BottomSheet
        isVisible={selectedTicketId !== null}
        onClose={() => setSelectedTicketId(null)}
        title={activeTicket ? `Chat: Ticket #${activeTicket.id}` : 'Support Chat'}
        height={0.7}
      >
        {activeTicket ? (
          <View style={{ flex: 1 }}>
            {/* Chat Ticket Overview */}
            <View style={styles.chatOverviewHeader}>
              <View>
                <Text style={styles.chatOverviewTitle}>{activeTicket.category} Issue</Text>
                <Text style={styles.chatOverviewSub}>Customer: {activeTicket.customer}</Text>
              </View>
              <View style={[
                styles.statusBadge, 
                { backgroundColor: activeTicket.status === 'Open' ? 'rgba(242, 169, 59, 0.08)' : 'rgba(34, 181, 115, 0.08)' }
              ]}>
                <Text style={[
                  styles.statusText, 
                  { color: activeTicket.status === 'Open' ? Colors.warning : Colors.success }
                ]}>
                  {activeTicket.status}
                </Text>
              </View>
            </View>

            {/* Chat Timeline */}
            <ScrollView 
              style={styles.chatTimeline} 
              contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 10 }}
            >
              {activeTicket.messages.map((m, idx) => {
                const isSystem = m.sender === 'system';
                if (isSystem) {
                  return (
                    <View key={idx} style={styles.systemMessageContainer}>
                      <Text style={styles.systemMessageText}>{m.text}</Text>
                    </View>
                  );
                }

                const isCustomer = m.sender === 'customer';
                const isMerchant = m.sender === 'merchant';
                return (
                  <View
                    key={idx}
                    style={[
                      styles.chatBubbleContainer,
                      isCustomer ? styles.alignLeft : styles.alignRight,
                    ]}
                  >
                    <View
                      style={[
                        styles.chatBubble,
                        isCustomer ? styles.bubbleCustomer : styles.bubbleMerchant,
                      ]}
                    >
                      <Text style={[
                        styles.bubbleSender, 
                        { color: isCustomer ? Colors.copper : Colors.primary }
                      ]}>
                        {isCustomer ? activeTicket.customer : m.sender === 'support' ? 'Support Representative' : 'Store Owner (You)'}
                      </Text>
                      <Text style={[
                        styles.bubbleBody, 
                        { color: isMerchant ? Colors.white : Colors.textPrimary }
                      ]}>
                        {m.text}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            {/* Chat Reply Input Bar */}
            {activeTicket.status === 'Open' ? (
              <View style={styles.chatEntryBar}>
                <TextInput
                  value={ticketReply}
                  onChangeText={setTicketReply}
                  placeholder="Type support response..."
                  placeholderTextColor={Colors.textSecondary}
                  style={styles.chatInput}
                />
                <TouchableOpacity
                  style={styles.sendBtn}
                  onPress={submitTicketMessage}
                >
                  <Send size={16} color={Colors.white} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.chatClosedBanner}>
                <CheckCircle size={16} color={Colors.success} />
                <Text style={styles.chatClosedText}>This ticket is resolved and closed.</Text>
              </View>
            )}
          </View>
        ) : null}
      </BottomSheet>
    </View>
  );
});

export default SupportScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 12,
    backgroundColor: Colors.background,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
  },
  statsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(228, 231, 236, 0.5)',
    borderRadius: 20,
    paddingVertical: 14,
    marginBottom: 24,
    ...Shadows.soft,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  statVal: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
  },
  directoryHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  ticketsList: {
    gap: 10,
  },
  ticketCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(228, 231, 236, 0.5)',
    padding: 16,
    borderRadius: 20,
    ...Shadows.soft,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ticketCat: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
  },
  ticketId: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: '600',
  },
  ticketCustomer: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  actionBlock: {
    alignItems: 'flex-end',
    gap: 8,
  },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 12,
    backgroundColor: Colors.background,
  },
  chatBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  resolveLink: {
    paddingVertical: 2,
  },
  resolveLinkText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.success,
  },
  chatOverviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  chatOverviewTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  chatOverviewSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  chatTimeline: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  systemMessageContainer: {
    alignSelf: 'center',
    backgroundColor: 'rgba(102, 112, 133, 0.06)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginVertical: 4,
  },
  systemMessageText: {
    fontSize: 9,
    color: Colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  chatBubbleContainer: {
    flexDirection: 'row',
    width: '100%',
    marginVertical: 4,
  },
  alignLeft: {
    justifyContent: 'flex-start',
  },
  alignRight: {
    justifyContent: 'flex-end',
  },
  chatBubble: {
    borderRadius: 16,
    padding: 10,
    maxWidth: '85%',
    ...Shadows.soft,
  },
  bubbleCustomer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 4,
  },
  bubbleMerchant: {
    backgroundColor: Colors.primary,
    borderTopRightRadius: 4,
  },
  bubbleSender: {
    fontSize: 9,
    fontWeight: '700',
    marginBottom: 4,
  },
  bubbleBody: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  chatEntryBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
    gap: 8,
    alignItems: 'center',
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    fontSize: 13,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatClosedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(34, 181, 115, 0.06)',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  chatClosedText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.success,
  },
});
