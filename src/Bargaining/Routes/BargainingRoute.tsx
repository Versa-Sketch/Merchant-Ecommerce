import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { observer } from 'mobx-react-lite';
import { MessageSquare, Send, TrendingDown } from 'lucide-react-native';
import { useStores } from '../../Common/hooks/useStores';
import { Colors } from '../../theme/colors';
import { Button } from '../../components/ui/Button';
import { BottomSheet } from '../../Common/components/BottomSheet';
import { AnimatedScreen } from '../../Common/components/AnimatedScreen';
import { Badge, Card, ScreenHeader } from '../../components/ui/MerchantPrimitives';
import styles from './styles';

const SECTIONS = ['Pending', 'Accepted', 'Rejected', 'Expired'] as const;

function formatTimer(seconds: number) {
  if (seconds <= 0) return '00:00';
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
}

export default observer(function BargainingScreen() {
  const { bargainingStore } = useStores();
  const [selectedSection, setSelectedSection] = useState<(typeof SECTIONS)[number]>('Pending');
  const [selectedBargainId, setSelectedBargainId] = useState<string | null>(null);
  const [counterId, setCounterId] = useState<string | null>(null);
  const [counterPrice, setCounterPrice] = useState(0);
  const [tick, setTick] = useState(0);
  const [chatInput, setChatInput] = useState('');
  const chatScrollRef = useRef<ScrollView>(null);
  const sendScale = useRef(new Animated.Value(1)).current;
  const initialTimes = useRef<Record<string, number>>({});

  useEffect(() => {
    bargainingStore.bargains.forEach((b) => {
      if (!(b.id in initialTimes.current)) initialTimes.current[b.id] = b.expirationTime;
    });
  }, [bargainingStore.bargains.length]);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  function getRemainingSeconds(bargainId: string, original: number) {
    return Math.max(0, (initialTimes.current[bargainId] ?? original) - tick);
  }

  const activeBargain = bargainingStore.bargains.find((item) => item.id === selectedBargainId);
  const counterBargain = bargainingStore.bargains.find((item) => item.id === counterId);

  const filtered =
    selectedSection === 'Pending' ? bargainingStore.pendingBargains
    : selectedSection === 'Accepted' ? bargainingStore.acceptedBargains
    : selectedSection === 'Rejected' ? bargainingStore.rejectedBargains
    : bargainingStore.expiredBargains;

  const countFor = (section: string) => {
    if (section === 'Pending') return bargainingStore.pendingBargains.length;
    if (section === 'Accepted') return bargainingStore.acceptedBargains.length;
    if (section === 'Rejected') return bargainingStore.rejectedBargains.length;
    return bargainingStore.expiredBargains.length;
  };

  const handleSend = () => {
    if (!chatInput.trim() || !selectedBargainId) return;
    Animated.sequence([
      Animated.spring(sendScale, { toValue: 0.82, useNativeDriver: true, speed: 40 }),
      Animated.spring(sendScale, { toValue: 1, useNativeDriver: true, speed: 20 }),
    ]).start();
    bargainingStore.sendMerchantMessage(selectedBargainId, chatInput);
    setChatInput('');
    setTimeout(() => chatScrollRef.current?.scrollToEnd({ animated: true }), 80);
  };

  const openCounter = (id: string) => {
    const bargain = bargainingStore.bargains.find((item) => item.id === id);
    if (!bargain) return;
    setCounterId(id);
    setCounterPrice(Math.round(bargain.customerOffer + (bargain.currentPrice - bargain.customerOffer) * 0.5));
  };

  return (
    <AnimatedScreen style={styles.container}>
      <ScreenHeader title="Bargains" subtitle={`${bargainingStore.pendingBargains.length} active negotiations`} />

      <View style={styles.tabs}>
        {SECTIONS.map((section) => (
          <TouchableOpacity key={section} style={[styles.tab, selectedSection === section && styles.tabActive]} onPress={() => setSelectedSection(section)}>
            <Text style={[styles.tabText, selectedSection === section && styles.tabTextActive]}>{section}</Text>
            {countFor(section) ? (
              <View style={styles.countPill}><Text style={styles.countPillText}>{countFor(section)}</Text></View>
            ) : null}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <Card style={styles.emptyCard}>
            <MessageSquare size={22} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>No requests here</Text>
            <Text style={styles.emptyText}>New bargain messages will appear in this inbox.</Text>
          </Card>
        ) : (
          filtered.map((bargain) => {
            const remaining = getRemainingSeconds(bargain.id, bargain.expirationTime);
            const isUrgent = remaining < 5 * 60;
            return (
              <Card key={bargain.id} style={styles.bargainCard}>
                <View style={styles.rowBetween}>
                  <Text style={styles.customerName}>{bargain.customerName}</Text>
                  {bargain.status === 'Pending' ? (
                    <View style={[styles.timerPill, isUrgent ? styles.timerUrgent : styles.timerSafe]}>
                      <Text style={[styles.timerText, isUrgent ? styles.timerTextUrgent : styles.timerTextSafe]}>{formatTimer(remaining)}</Text>
                    </View>
                  ) : (
                    <Badge label={bargain.status} tone={bargain.status === 'Accepted' ? 'success' : 'neutral'} />
                  )}
                </View>
                <Text style={styles.productName}>{bargain.productName}</Text>
                <View style={[styles.rowBetween, styles.offerRow]}>
                  <Text style={styles.offerLabel}>Customer offer</Text>
                  <Text style={styles.offerAmount}>₹{bargain.customerOffer}</Text>
                </View>
                {bargain.status === 'Pending' ? (
                  <View style={styles.actions}>
                    <Button label="Accept" size="sm" onPress={() => bargainingStore.acceptBargain(bargain.id)} style={styles.actionBtn} />
                    <Button label="Counter" variant="secondary" size="sm" onPress={() => openCounter(bargain.id)} style={styles.actionBtn} />
                    <Button label="Reject" variant="outline" size="sm"
                      onPress={() => Alert.alert('Reject offer', 'Reject this bargain request?', [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Reject', style: 'destructive', onPress: () => bargainingStore.rejectBargain(bargain.id) },
                      ])}
                      style={styles.actionBtn}
                    />
                  </View>
                ) : (
                  <Button label="View Chat" variant="ghost" size="sm" onPress={() => setSelectedBargainId(bargain.id)} />
                )}
              </Card>
            );
          })
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomSheet isVisible={counterId !== null} onClose={() => setCounterId(null)} title="Counter Offer" height={0.48}>
        {counterBargain ? (
          <View style={styles.sheet}>
            <Text style={styles.sheetProduct}>{counterBargain.productName}</Text>
            <View style={styles.counterBox}>
              <Text style={styles.counterLabel}>Counter price</Text>
              <Text style={styles.counterPrice}>₹{counterPrice}</Text>
              <View style={styles.counterActions}>
                <TouchableOpacity style={styles.stepButton} onPress={() => setCounterPrice(Math.max(counterBargain.customerOffer, counterPrice - 5))}>
                  <Text style={styles.stepText}>− ₹5</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.stepButton, styles.stepButtonActive]} onPress={() => setCounterPrice(Math.min(counterBargain.currentPrice, counterPrice + 5))}>
                  <Text style={[styles.stepText, styles.stepTextActive]}>+ ₹5</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Card style={styles.marginCard}>
              <TrendingDown size={15} color={Colors.success} />
              <Text style={styles.marginText}>Expected profit: ₹{counterPrice - counterBargain.merchantCost}</Text>
            </Card>
            <Button label="Send Counter" onPress={() => { bargainingStore.counterBargain(counterBargain.id, counterPrice); setCounterId(null); }} />
          </View>
        ) : null}
      </BottomSheet>

      <BottomSheet isVisible={selectedBargainId !== null} onClose={() => { setSelectedBargainId(null); setChatInput(''); }} title="Conversation" height={0.82}>
        {activeBargain ? (
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}>
            <ScrollView ref={chatScrollRef} contentContainerStyle={styles.chat} showsVerticalScrollIndicator={false} onContentSizeChange={() => chatScrollRef.current?.scrollToEnd({ animated: false })}>
              {activeBargain.timeline.map((message) => {
                const merchant = message.sender === 'merchant';
                const system = message.sender === 'system';
                if (system) {
                  return (
                    <View key={message.id} style={styles.systemRow}>
                      <Text style={styles.systemText}>{message.message}</Text>
                      <Text style={styles.systemTime}>{message.time}</Text>
                    </View>
                  );
                }
                return (
                  <View key={message.id} style={[styles.bubble, merchant && styles.bubbleMerchant]}>
                    <Text style={[styles.bubbleSender, merchant && styles.bubbleSenderMerchant]}>{merchant ? 'You' : activeBargain.customerName}</Text>
                    <Text style={[styles.bubbleBody, merchant && styles.bubbleBodyMerchant]}>{message.message}</Text>
                    {message.price ? <Text style={[styles.priceChip, merchant && styles.priceChipMerchant]}>₹{message.price}</Text> : null}
                    <Text style={[styles.bubbleTime, merchant && styles.bubbleTimeMerchant]}>{message.time}</Text>
                  </View>
                );
              })}
            </ScrollView>
            <View style={styles.inputBar}>
              <TextInput style={styles.inputField} value={chatInput} onChangeText={setChatInput} placeholder="Type a message…" placeholderTextColor={Colors.textMuted} multiline maxLength={300} onSubmitEditing={handleSend} returnKeyType="send" />
              <Animated.View style={{ transform: [{ scale: sendScale }] }}>
                <TouchableOpacity style={[styles.sendBtn, !chatInput.trim() && styles.sendBtnDisabled]} onPress={handleSend} activeOpacity={0.8} disabled={!chatInput.trim()}>
                  <Send size={18} color={Colors.white} />
                </TouchableOpacity>
              </Animated.View>
            </View>
          </KeyboardAvoidingView>
        ) : null}
      </BottomSheet>
    </AnimatedScreen>
  );
});
