import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useMemo, useState } from 'react';
import { s, vs } from 'react-native-size-matters';
import { useTheme, useThemedStyles } from '../theme';
import type { Theme } from '../theme';
import { useImageAttachments } from '../hooks/useImageAttachments';
import { useChatSession } from '../navigation/ChatSessionContext';
import { navigationRef } from '../navigation/navigationRef';
import AttachmentPreviewModal from '../components/AttachmentPreviewModal';
import type { ImageAttachment } from '../types/attachments';

const GAP = s(10);
const TILE_SIZE = (Dimensions.get('window').width - GAP * 3) / 2;

const DAY_MS = 24 * 60 * 60 * 1000;

type TimeFilter = 'all' | 'today' | 'week' | 'month';
type SortOption = 'newest' | 'oldest' | 'largest';

const TIME_FILTERS: { value: TimeFilter; label: string }[] = [
  { value: 'all', label: 'All time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'largest', label: 'Largest' },
];

function timeCutoff(filter: TimeFilter) {
  const now = new Date();
  switch (filter) {
    case 'today':
      return new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      ).getTime();
    case 'week':
      return now.getTime() - 7 * DAY_MS;
    case 'month':
      return now.getTime() - 30 * DAY_MS;
    default:
      return null;
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    filters: {
      paddingTop: vs(10),
      paddingBottom: vs(8),
      gap: vs(8),
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    chipRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(8),
      paddingHorizontal: s(14),
    },
    chip: {
      paddingVertical: vs(6),
      paddingHorizontal: s(12),
      borderRadius: s(16),
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    chipActive: {
      backgroundColor: theme.colors.accent,
      borderColor: theme.colors.accent,
    },
    chipText: {
      fontSize: s(12),
      color: theme.colors.textMuted,
    },
    chipTextActive: {
      color: theme.colors.background,
      fontWeight: '600',
    },
    sortLabel: {
      fontSize: s(12),
      fontWeight: '600',
      color: theme.colors.textMuted,
    },
    grid: {
      padding: GAP,
      gap: GAP,
    },
    column: {
      gap: GAP,
    },
    tile: {
      width: TILE_SIZE,
      height: TILE_SIZE,
      borderRadius: s(12),
      overflow: 'hidden',
      backgroundColor: theme.colors.surface,
    },
    tileImage: {
      width: '100%',
      height: '100%',
    },
    centered: {
      paddingTop: vs(48),
      alignItems: 'center',
    },
    emptyText: {
      fontSize: s(13),
      color: theme.colors.textMuted,
    },
  });

type ChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

const Chip = ({ label, active, onPress }: ChipProps) => {
  const styles = useThemedStyles(makeStyles);

  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const ImagesScreen = () => {
  const styles = useThemedStyles(makeStyles);
  const theme = useTheme();
  const { images, loading } = useImageAttachments();
  const { selectConversation } = useChatSession();

  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>('newest');
  const [selected, setSelected] = useState<ImageAttachment | null>(null);

  // Only chats that actually contributed an image are worth offering.
  const conversations = useMemo(() => {
    const titleById = new Map<string, string>();
    images.forEach(image =>
      titleById.set(image.conversationId, image.conversationTitle),
    );
    return [...titleById].map(([id, title]) => ({ id, title }));
  }, [images]);

  const visibleImages = useMemo(() => {
    const cutoff = timeCutoff(timeFilter);
    const filtered = images.filter(image => {
      if (conversationId && image.conversationId !== conversationId) {
        return false;
      }
      if (cutoff && new Date(image.createdAt).getTime() < cutoff) return false;
      return true;
    });

    return filtered.sort((a, b) => {
      if (sort === 'largest') return b.sizeBytes - a.sizeBytes;
      const delta =
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sort === 'oldest' ? delta : -delta;
    });
  }, [images, conversationId, timeFilter, sort]);

  const handleOpenChat = () => {
    if (!selected) return;
    selectConversation({
      id: selected.conversationId,
      title: selected.conversationTitle,
    });
    setSelected(null);
    if (navigationRef.isReady()) navigationRef.navigate('Chat');
  };

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {TIME_FILTERS.map(filter => (
            <Chip
              key={filter.value}
              label={filter.label}
              active={timeFilter === filter.value}
              onPress={() => setTimeFilter(filter.value)}
            />
          ))}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          <Chip
            label="All chats"
            active={conversationId === null}
            onPress={() => setConversationId(null)}
          />
          {conversations.map(conversation => (
            <Chip
              key={conversation.id}
              label={conversation.title}
              active={conversationId === conversation.id}
              onPress={() => setConversationId(conversation.id)}
            />
          ))}
        </ScrollView>

        <View style={styles.chipRow}>
          <Text style={styles.sortLabel}>Sort</Text>
          {SORT_OPTIONS.map(option => (
            <Chip
              key={option.value}
              label={option.label}
              active={sort === option.value}
              onPress={() => setSort(option.value)}
            />
          ))}
        </View>
      </View>

      <FlatList
        data={visibleImages}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.column}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.tile}
            onPress={() => setSelected(item)}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: item.url }}
              style={styles.tileImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          loading ? (
            <View style={styles.centered}>
              <ActivityIndicator color={theme.colors.textMuted} />
            </View>
          ) : (
            <View style={styles.centered}>
              <Text style={styles.emptyText}>
                {images.length === 0
                  ? 'No images yet'
                  : 'No images match these filters'}
              </Text>
            </View>
          )
        }
      />

      <AttachmentPreviewModal
        visible={!!selected}
        attachment={selected}
        url={selected?.url}
        subtitle={
          selected
            ? `${selected.conversationTitle} · ${formatDate(selected.createdAt)}`
            : undefined
        }
        actionLabel="Open chat"
        onAction={handleOpenChat}
        onClose={() => setSelected(null)}
      />
    </View>
  );
};

export default ImagesScreen;
