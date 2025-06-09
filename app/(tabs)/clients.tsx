import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, SectionList, StyleSheet, TouchableOpacity } from 'react-native';

// Your Spreadsheet ID and range
const spreadsheetId = '16Jy4ZJDRZekpGAMA6ljSF-0ClpOB89kToZHbpbL3gRk';
const range = 'Clients!A2:F10'; // Adjust to match your sheet

// Your public API key (make sure your sheet is set to "Anyone with the link can view")
const apiKey = 'AIzaSyCU0nRf275gOXo_Rr2Kmz8UQaarjjdV5Uw'; // <-- Replace with your actual API key

export default function ClientsPage() {
  type Client = {
    name: string;
    phone?: string;
    email?: string;
    type?: string;
    ageRange?: string;
    notes?: string;
  };

  type SectionData = {
    title: string;
    data: Client[];
  };
  // const [clients, setClients] = useState<Client[]>([]);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`
        );
        const data = await response.json();
        const clientList = data.values
          ? data.values
              .map((row: string[]) => ({
                name: row[0],
                phone: row[1],
                email: row[2],
                type: row[3],
                ageRange: row[4],
                notes: row[5],
              }))
              .sort((a: any, b: any) => (a.type || '').localeCompare(b.type || ''))
          : [];
        const grouped = groupClientsByType(clientList);
        setSections(grouped);
      } catch (error) {
        console.error('Error fetching client data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const groupClientsByType = (clients: Client[]): SectionData[] => {
    const grouped: { [key: string]: Client[] } = {};

    for (const client of clients) {
      const type = client.type || 'Uncategorized';
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(client);
    }

    return Object.entries(grouped).map(([type, data]) => ({
      title: type,
      data,
    }));
  };

  return (
    <ParallaxScrollView
          headerHeight={120}
          headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
          headerImage={
            <Image
              source={require('@/assets/images/mc_banner.png')}
              style={styles.reactLogo}
            />
          }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Client List</ThemedText>
      </ThemedView>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item, index) => `${item.name}-${index}`}
          contentContainerStyle={styles.listContainer}
          renderSectionHeader={({ section: { title } }) => (
            <ThemedText type="subtitle" style={styles.sectionHeader}>
              {title}
            </ThemedText>
          )}
          renderItem={({ item }) => (
          <ThemedView style={styles.card}>
            <ThemedText style={styles.name}>{item.name}</ThemedText>
            {item.notes && (
              <ThemedText style={styles.subtext}>{item.notes}</ThemedText>
            )}
            <ThemedView style={styles.buttonRow}>
              <TouchableOpacity style={styles.button} onPress={() => {
                if (item.phone) {
                  Linking.openURL(`tel:$item.phone`);
                }
              }}>
                <ThemedText style={styles.buttonText}>Call</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => {
                if (item.email) {
                  Linking.openURL(`mailto:$item.email`);
                }
              }}>
                <ThemedText style={styles.buttonText}>Message</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        )}
        />
      )}
    </ParallaxScrollView>
  );
}


const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 120,
    width: '100%',
    resizeMode: 'cover',
    // bottom: 0,
    // left: 0,
    // position: 'absolute',
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 8,
    fontSize: 18,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 8,
    paddingBottom: 32,
    gap: 12,
  },
  card: {
    backgroundColor: '#ffffff10',
    padding: 8,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  subtext: {
    fontSize: 15,
    color: '#888',
    marginTop: 4,
  },
  buttonRow: {
    backgroundColor: '#ffffff10',
    flexDirection: 'row',
    marginTop: 8,
    gap: 12,
  },
  button: {
    backgroundColor: '#1D3D47',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
