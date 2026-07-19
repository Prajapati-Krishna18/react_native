import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSurveys } from '../../context/SurveyContext';
import { CustomHeader } from '../../components/CustomHeader';

export default function DashboardScreen() {
  const router = useRouter();
  const { surveys } = useSurveys();

  // Calculate today's date string
  const todayStr = new Date().toISOString().split('T')[0];

  // Calculate Today's Survey Count
  const todaysSurveys = surveys.filter((s) => s.date === todayStr);
  const todaysCount = todaysSurveys.length;
  const totalCount = surveys.length;

  // Recent 3 surveys
  const recentSurveys = surveys.slice(0, 3);

  // Helper for priority color badge
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return { bg: '#FEE2E2', text: '#EF4444' }; // Red
      case 'Medium':
        return { bg: '#FEF3C7', text: '#D97706' }; // Orange
      case 'Low':
      default:
        return { bg: '#E0F2FE', text: '#0284C7' }; // Blue
    }
  };

  const quickActions = [
    {
      title: 'New Survey',
      icon: 'add-circle',
      color: '#10B981',
      bg: '#ECFDF5',
      route: '/(tabs)/create',
    },
    {
      title: 'History',
      icon: 'time',
      color: '#3B82F6',
      bg: '#EFF6FF',
      route: '/(tabs)/history',
    },
    {
      title: 'Camera',
      icon: 'camera',
      color: '#8B5CF6',
      bg: '#F5F3FF',
      route: '/camera',
    },
    {
      title: 'Location',
      icon: 'location',
      color: '#EF4444',
      bg: '#FEF2F2',
      route: '/location',
    },
    {
      title: 'Contacts',
      icon: 'people',
      color: '#F59E0B',
      bg: '#FFFBEB',
      route: '/contacts',
    },
    {
      title: 'Clipboard',
      icon: 'clipboard',
      color: '#EC4899',
      bg: '#FDF2F8',
      route: '/clipboard',
    },
  ];

  return (
    <View style={styles.container}>
      <CustomHeader title="Dashboard" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Welcome Card & Student Details */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeHeader}>
            <View>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.studentName}>Krish Surveyor</Text>
            </View>
            <View style={styles.studentBadge}>
              <Text style={styles.studentBadgeText}>Active</Text>
            </View>
          </View>
          <View style={styles.studentDetailsDivider} />
          <View style={styles.studentInfoRow}>
            <View style={styles.studentInfoItem}>
              <Ionicons name="card" size={16} color="#6B7280" />
              <Text style={styles.studentInfoValue}>20BCE1023</Text>
            </View>
            <View style={styles.studentInfoItem}>
              <Ionicons name="git-branch" size={16} color="#6B7280" />
              <Text style={styles.studentInfoValue}>Civil & Geo-Info</Text>
            </View>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsRow}>
          <View style={styles.statsCard}>
            <View style={[styles.statsIconBg, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="today" size={24} color="#3B82F6" />
            </View>
            <Text style={styles.statsValue}>{todaysCount}</Text>
            <Text style={styles.statsLabel}>Today's Surveys</Text>
          </View>

          <View style={styles.statsCard}>
            <View style={[styles.statsIconBg, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="checkmark-done-circle" size={24} color="#10B981" />
            </View>
            <Text style={styles.statsValue}>{totalCount}</Text>
            <Text style={styles.statsLabel}>Total Surveys</Text>
          </View>
        </View>

        {/* Quick Actions Grid */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.grid}>
          {quickActions.map((action, idx) => (
            <Pressable
              key={idx}
              style={styles.gridCard}
              onPress={() => router.push(action.route as any)}
            >
              <View style={[styles.gridIconBg, { backgroundColor: action.bg }]}>
                <Ionicons name={action.icon as any} size={28} color={action.color} />
              </View>
              <Text style={styles.gridLabel}>{action.title}</Text>
            </Pressable>
          ))}
        </View>

        {/* Recent Survey Summary */}
        <View style={styles.recentSectionHeader}>
          <Text style={styles.sectionTitle}>Recent Surveys</Text>
          {totalCount > 0 && (
            <Pressable onPress={() => router.push('/(tabs)/history')}>
              <Text style={styles.viewAllText}>View All</Text>
            </Pressable>
          )}
        </View>

        {recentSurveys.length === 0 ? (
          <View style={styles.emptyStateCard}>
            <Ionicons name="document-text-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyStateTitle}>No surveys found</Text>
            <Text style={styles.emptyStateSubtitle}>
              Tap 'New Survey' to start collecting field data.
            </Text>
          </View>
        ) : (
          <View style={styles.recentList}>
            {recentSurveys.map((survey) => {
              const priorityColors = getPriorityColor(survey.priority);
              return (
                <Pressable
                  key={survey.id}
                  style={styles.recentItem}
                  onPress={() => router.push('/(tabs)/history')}
                >
                  <View style={styles.recentItemLeft}>
                    <Text style={styles.recentSiteName} numberOfLines={1}>
                      {survey.siteName}
                    </Text>
                    <Text style={styles.recentClientName} numberOfLines={1}>
                      Client: {survey.clientName}
                    </Text>
                    <Text style={styles.recentDate}>{survey.date}</Text>
                  </View>
                  <View style={styles.recentItemRight}>
                    <View
                      style={[
                        styles.priorityBadge,
                        { backgroundColor: priorityColors.bg },
                      ]}
                    >
                      <Text style={[styles.priorityText, { color: priorityColors.text }]}>
                        {survey.priority}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6', // Light gray background
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 14,
    color: '#6B7280',
  },
  studentName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 2,
  },
  studentBadge: {
    backgroundColor: '#D1FAE5',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  studentBadgeText: {
    color: '#065F46',
    fontSize: 12,
    fontWeight: '600',
  },
  studentDetailsDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 14,
  },
  studentInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  studentInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  studentInfoValue: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statsIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  statsLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    rowGap: 12,
  },
  gridCard: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  gridIconBg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  gridLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  recentSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  emptyStateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 12,
  },
  emptyStateSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  recentList: {
    gap: 10,
  },
  recentItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  recentItemLeft: {
    flex: 1,
  },
  recentSiteName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  recentClientName: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 2,
  },
  recentDate: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  recentItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
});
