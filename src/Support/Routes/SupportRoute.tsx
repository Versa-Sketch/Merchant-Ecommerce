import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { router } from 'expo-router';
import { Colors } from '../../theme/colors';
import { Button } from '../../components/ui/Button';
import { BottomSheet } from '../../Common/components/BottomSheet';
import { ArrowLeft, MessageSquare, CheckCircle, Send } from 'lucide-react-native';
import styles from './styles';

interface ChatMessage { sender: 'customer' | 'merchant' | 'support' | 'system'; text: string; }
interface SupportTicket { id: string; category: string; customer: string; date: string; status: 'Open' | 'Resolved'; messages: ChatMessage[]; }

export default observer(function SupportScreen() {
  const insets = useSafeAreaInsets();
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [ticketReply, setTicketReply] = useState('');
  const [tickets, setTickets] = useState<SupportTicket[]>([
    { id: 'T-4091', category: 'Wrong Product', customer: 'Meera Nair', date: '3 hrs ago', status: 'Open', messages: [
      { sender: 'customer', text: 'Hey, I received Crocin pain relief instead of Crocin cold!' },
      { sender: 'system', text: 'Ticket registered. Merchant assigned.' },
    ]},
    { id: 'T-4089', category: 'Refund', customer: 'Suresh Kumar', date: 'Yesterday', status: 'Resolved', messages: [
      { sender: 'customer', text: 'Order was cancelled, where is my refund?' },
      { sender: 'support', text: 'Refund of ₹80 processed to your source account.' },
    ]},
  ]);

  const submitTicketMessage = () => {
    if (!selectedTicketId || !ticketReply.trim()) return;
    setTickets(tickets.map((t) => t.id === selectedTicketId ? { ...t, messages: [...t.messages, { sender: 'merchant' as const, text: ticketReply.trim() }] } : t));
    setTicketReply('');
    Alert.alert('Message Sent', 'Your response has been sent to customer support.');
  };

  const handleResolveTicket = (id: string) => {
    setTickets(tickets.map((t) => t.id === id ? { ...t, status: 'Resolved' as const, messages: [...t.messages, { sender: 'system' as const, text: 'Ticket has been marked as RESOLVED by the merchant.' }] } : t));
    Alert.alert('Ticket Resolved', 'The support ticket has been closed.');
  };

  const activeTicket = tickets.find((t) => t.id === selectedTicketId);

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
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
        <View style={styles.statsBanner}>
          {[
            { label: 'OPEN TICKETS', val: tickets.filter((t) => t.status === 'Open').length, color: Colors.warning },
            { label: 'AVG RESOLUTION', val: '14 mins', color: Colors.primary },
            { label: 'RESOLVED TODAY', val: tickets.filter((t) => t.status === 'Resolved').length, color: Colors.success },
          ].map(({ label, val, color }, i) => (
            <React.Fragment key={label}>
              {i > 0 && <View style={styles.statDivider} />}
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>{label}</Text>
                <Text style={[styles.statVal, { color }]}>{val}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        <Text style={styles.directoryHeader}>Support Directory</Text>
        <View style={styles.ticketsList}>
          {tickets.map((t) => (
            <View key={t.id} style={styles.ticketCard}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <View style={styles.row}>
                  <Text style={styles.ticketCat}>{t.category} Ticket</Text>
                  <View style={[styles.statusBadge, { backgroundColor: t.status === 'Open' ? 'rgba(242, 169, 59, 0.08)' : 'rgba(34, 181, 115, 0.08)' }]}>
                    <Text style={[styles.statusText, { color: t.status === 'Open' ? Colors.warning : Colors.success }]}>{t.status}</Text>
                  </View>
                </View>
                <Text style={styles.ticketId}>ID: #{t.id}</Text>
                <Text style={styles.ticketCustomer}>Filed by: {t.customer} • {t.date}</Text>
              </View>
              <View style={styles.actionBlock}>
                <TouchableOpacity style={[styles.chatBtn, t.status !== 'Open' && { borderColor: Colors.border }]} onPress={() => setSelectedTicketId(t.id)}>
                  <MessageSquare size={14} color={t.status === 'Open' ? Colors.primary : Colors.textSecondary} />
                  <Text style={[styles.chatBtnText, { color: t.status === 'Open' ? Colors.primary : Colors.textSecondary }]}>Chat</Text>
                </TouchableOpacity>
                {t.status === 'Open' && (
                  <TouchableOpacity style={styles.resolveLink} onPress={() => handleResolveTicket(t.id)}>
                    <Text style={styles.resolveLinkText}>Resolve</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomSheet isVisible={selectedTicketId !== null} onClose={() => setSelectedTicketId(null)} title={activeTicket ? `Chat: Ticket #${activeTicket.id}` : 'Support Chat'} height={0.7}>
        {activeTicket ? (
          <View style={{ flex: 1 }}>
            <View style={styles.chatOverviewHeader}>
              <View>
                <Text style={styles.chatOverviewTitle}>{activeTicket.category} Issue</Text>
                <Text style={styles.chatOverviewSub}>Customer: {activeTicket.customer}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: activeTicket.status === 'Open' ? 'rgba(242, 169, 59, 0.08)' : 'rgba(34, 181, 115, 0.08)' }]}>
                <Text style={[styles.statusText, { color: activeTicket.status === 'Open' ? Colors.warning : Colors.success }]}>{activeTicket.status}</Text>
              </View>
            </View>
            <ScrollView style={styles.chatTimeline} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 10 }}>
              {activeTicket.messages.map((m, idx) => {
                if (m.sender === 'system') {
                  return (
                    <View key={idx} style={styles.systemMessageContainer}>
                      <Text style={styles.systemMessageText}>{m.text}</Text>
                    </View>
                  );
                }
                const isCustomer = m.sender === 'customer';
                const isMerchant = m.sender === 'merchant';
                return (
                  <View key={idx} style={[styles.chatBubbleContainer, isCustomer ? styles.alignLeft : styles.alignRight]}>
                    <View style={[styles.chatBubble, isCustomer ? styles.bubbleCustomer : styles.bubbleMerchant]}>
                      <Text style={[styles.bubbleSender, { color: isCustomer ? Colors.copper : Colors.primary }]}>
                        {isCustomer ? activeTicket.customer : m.sender === 'support' ? 'Support Representative' : 'Store Owner (You)'}
                      </Text>
                      <Text style={[styles.bubbleBody, { color: isMerchant ? Colors.white : Colors.textPrimary }]}>{m.text}</Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
            {activeTicket.status === 'Open' ? (
              <View style={styles.chatEntryBar}>
                <TextInput value={ticketReply} onChangeText={setTicketReply} placeholder="Type support response..." placeholderTextColor={Colors.textSecondary} style={styles.chatInput} />
                <TouchableOpacity style={styles.sendBtn} onPress={submitTicketMessage}>
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
