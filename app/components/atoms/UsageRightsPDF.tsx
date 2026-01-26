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

import { type ShootWithClient } from '@/app/utils/shootOperations'
import { type UsageRights } from '@/app/utils/usageRightsOperations'

interface UsageRightsPDFProps {
  shootData: ShootWithClient
  usageRights?: UsageRights
}

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateString
  }
}

const UsageRightsPDF = ({ shootData, usageRights }: UsageRightsPDFProps) => {
  const clientName = shootData.clients?.name || 'Unknown Client'
  
  return (
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
            <Text>{clientName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date Completed:</Text>
            <Text>{formatDate(shootData.shoot_date)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text>{shootData.status.charAt(0).toUpperCase() + shootData.status.slice(1)}</Text>
          </View>
        </View>
        
        {/* Usage Terms Section */}
        {usageRights && (
          <View style={styles.section}>
            <Text style={styles.heading}>Usage Terms</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Usage Type:</Text>
              <Text>{usageRights.usage_type}</Text>
            </View>
            {usageRights.start_date && (
              <View style={styles.row}>
                <Text style={styles.label}>Start Date:</Text>
                <Text>{formatDate(usageRights.start_date)}</Text>
              </View>
            )}
            {usageRights.end_date && (
              <View style={styles.row}>
                <Text style={styles.label}>End Date:</Text>
                <Text style={{ fontWeight: 'bold' }}>{formatDate(usageRights.end_date)}</Text>
              </View>
            )}
            {usageRights.restrictions && (
              <>
                <Text style={styles.subheading}>Restrictions:</Text>
                <Text style={styles.text}>{usageRights.restrictions}</Text>
              </>
            )}
          </View>
        )}

        {/* Rights and Restrictions Section */}
        <View style={styles.section}>
          <Text style={styles.heading}>Rights and Restrictions</Text>
          
          {usageRights ? (
            <>
              <Text style={styles.subheading}>Usage Type:</Text>
              <Text style={styles.text}>{usageRights.usage_type}</Text>
              {usageRights.end_date && (
                <Text style={styles.listItem}>• Usage rights expire on {formatDate(usageRights.end_date)}</Text>
              )}
            </>
          ) : (
            <>
              <Text style={styles.subheading}>Granted Rights:</Text>
              <Text style={styles.listItem}>• Right to use images for marketing and promotional purposes</Text>
              <Text style={styles.listItem}>• Right to display images on digital platforms and websites</Text>
              <Text style={styles.listItem}>• Right to use images in print materials</Text>
              
              <Text style={styles.subheading}>Restrictions:</Text>
              <Text style={styles.listItem}>• Images may not be resold or redistributed without permission</Text>
              <Text style={styles.listItem}>• Images may not be used for defamatory or illegal purposes</Text>
            </>
          )}
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
}

// Function to download PDF
export const downloadUsageRightsPDF = async (
  shootData: ShootWithClient,
  usageRights?: UsageRights
) => {
  const doc = <UsageRightsPDF shootData={shootData} usageRights={usageRights} />
  const blob = await pdf(doc).toBlob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `usage-rights-${shootData.title.replace(/\s+/g, '-')}.pdf`
  link.click()
  URL.revokeObjectURL(url)
}

export default UsageRightsPDF
