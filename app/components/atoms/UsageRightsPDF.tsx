'use client'

import React from 'react'
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 24,
    marginBottom: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  section: {
    marginBottom: 25,
  },
  heading: {
    fontSize: 16,
    marginBottom: 12,
    fontWeight: 'bold',
    borderBottom: '1pt solid #000',
    paddingBottom: 5,
  },
  subheading: {
    fontSize: 14,
    marginBottom: 8,
    marginTop: 8,
    fontWeight: 'bold',
  },
  text: {
    marginBottom: 6,
    lineHeight: 1.5,
  },
  label: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  listItem: {
    marginBottom: 4,
    marginLeft: 15,
    paddingLeft: 5,
  },
  paragraph: {
    marginBottom: 8,
    lineHeight: 1.5,
  },
})

interface UsageRightsPDFProps {
  shootData: {
    title: string
    client: string
    doneDate: string
    deliveredDate: string
    expiryDate: string
    description: string
  }
}

const UsageRightsPDF = ({ shootData }: UsageRightsPDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Usage Rights</Text>
      
      {/* Project Details Section */}
      <View style={styles.section}>
        <Text style={styles.heading}>Project Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Title:</Text>
          <Text>{shootData.title}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Client:</Text>
          <Text>{shootData.client}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Date Completed:</Text>
          <Text>{shootData.doneDate}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Delivered:</Text>
          <Text>{shootData.deliveredDate}</Text>
        </View>
      </View>
      
      {/* Usage Terms Section */}
      <View style={styles.section}>
        <Text style={styles.heading}>Usage Terms</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Expiry Date:</Text>
          <Text style={{ fontWeight: 'bold' }}>{shootData.expiryDate}</Text>
        </View>
        <Text style={styles.subheading}>Description:</Text>
        <Text style={styles.text}>{shootData.description}</Text>
      </View>

      {/* Rights and Restrictions Section */}
      <View style={styles.section}>
        <Text style={styles.heading}>Rights and Restrictions</Text>
        
        <Text style={styles.subheading}>Granted Rights:</Text>
        <Text style={styles.listItem}>• Right to use images for marketing and promotional purposes</Text>
        <Text style={styles.listItem}>• Right to display images on digital platforms and websites</Text>
        <Text style={styles.listItem}>• Right to use images in print materials</Text>
        
        <Text style={styles.subheading}>Restrictions:</Text>
        <Text style={styles.listItem}>• Images may not be resold or redistributed without permission</Text>
        <Text style={styles.listItem}>• Images may not be used for defamatory or illegal purposes</Text>
        <Text style={styles.listItem}>• Usage rights expire on {shootData.expiryDate}</Text>
      </View>

      {/* Additional Terms Section */}
      <View style={styles.section}>
        <Text style={styles.heading}>Additional Terms</Text>
        <Text style={styles.paragraph}>
          All usage rights are subject to the terms and conditions outlined in the original agreement. 
          Any unauthorized use beyond the scope of these rights may result in legal action.
        </Text>
        <Text style={styles.paragraph}>
          For questions regarding usage rights or to request extensions, please contact the 
          original photographer or licensing agent.
        </Text>
      </View>
    </Page>
  </Document>
)

// Function to download PDF
export const downloadUsageRightsPDF = async (shootData: {
  title: string
  client: string
  doneDate: string
  deliveredDate: string
  expiryDate: string
  description: string
}) => {
  const doc = <UsageRightsPDF shootData={shootData} />
  const blob = await pdf(doc).toBlob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `usage-rights-${shootData.title.replace(/\s+/g, '-')}.pdf`
  link.click()
  URL.revokeObjectURL(url)
}

export default UsageRightsPDF
