import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import {
  FileText,
  Image as ImageIcon,
  Video,
  FileSpreadsheet,
  File,
  Volume2,
} from 'lucide-react-native';

export type FileCategory = 'pdf' | 'image' | 'video' | 'audio' | 'spreadsheet' | 'document' | 'other';

export function getFileCategory(fileName: string): FileCategory {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'pdf':
      return 'pdf';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return 'image';
    case 'mp4':
    case 'm4v':
    case 'mov':
      return 'video';
    case 'mp3':
    case 'wav':
      return 'audio';
    case 'xls':
    case 'xlsx':
    case 'csv':
      return 'spreadsheet';
    case 'doc':
    case 'docx':
    case 'txt':
    case 'rtf':
      return 'document';
    default:
      return 'other';
  }
}

type Props = {
  fileName: string;
  size?: number;
  iconSize?: number;
  style?: ViewStyle;
};

export function DocumentIcon({ fileName, size = 40, iconSize = 20, style }: Props) {
  const category = getFileCategory(fileName);
  
  let IconComponent = File;
  let color = '#6b7280';
  let backgroundColor = '#f9fafb';
  let borderColor = '#f3f4f6';

  switch (category) {
    case 'pdf':
      IconComponent = FileText;
      color = '#ef4444';
      backgroundColor = '#fef2f2';
      borderColor = '#fee2e2';
      break;
    case 'image':
      IconComponent = ImageIcon;
      color = '#f59e0b';
      backgroundColor = '#fffbeb';
      borderColor = '#fef3c7';
      break;
    case 'video':
      IconComponent = Video;
      color = '#8b5cf6';
      backgroundColor = '#f5f3ff';
      borderColor = '#ede9fe';
      break;
    case 'audio':
      IconComponent = Volume2;
      color = '#06b6d4';
      backgroundColor = '#ecfeff';
      borderColor = '#cffafe';
      break;
    case 'spreadsheet':
      IconComponent = FileSpreadsheet;
      color = '#10b981';
      backgroundColor = '#ecfdf5';
      borderColor = '#d1fae5';
      break;
    case 'document':
      IconComponent = FileText;
      color = '#3b82f6';
      backgroundColor = '#eff6ff';
      borderColor = '#dbeafe';
      break;
    default:
      IconComponent = File;
      color = '#6b7280';
      backgroundColor = '#f9fafb';
      borderColor = '#f3f4f6';
      break;
  }

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 4,
          backgroundColor,
          borderColor,
        },
        style,
      ]}
    >
      <IconComponent color={color} size={iconSize} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
