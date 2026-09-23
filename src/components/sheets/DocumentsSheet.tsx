import { FontAwesome6 } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Linking,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from "react-native";
import { DocumentUploadInput, SiteDocument } from "../../hooks/useDocuments";
import { colors } from "../../theme";
import { FontAwesomeIcon } from "../../types/icons";
import { formatDateTime } from "../../utils/date";
import { AttachmentPicker } from "../AttachmentPicker";
import { useAppDialog } from "../AppDialog";
import { DropdownField } from "../DropdownField";
import { PrimaryButton, Surface } from "../ui";
import { Info } from "./SupportSheets";
import { sheetStyles } from "./styles";

const categories = [
  "Drawing",
  "Bill / Challan",
  "Quotation",
  "Schedule",
  "Measurement Sheet",
  "Payment Document",
  "Supporting Document",
];

type SelectedAsset = Pick<
  DocumentUploadInput,
  "name" | "uri" | "mimeType" | "size"
>;

export function DocumentsSheet({
  documents,
  onUpload,
}: {
  documents: SiteDocument[];
  onUpload: (input: DocumentUploadInput) => void;
}) {
  const dialog = useAppDialog();
  const [asset, setAsset] = useState<SelectedAsset | null>(null);
  const [category, setCategory] = useState("");
  const [projectFilter, setProjectFilter] = useState("All projects");
  const [siteFilter, setSiteFilter] = useState("All sites");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = documents.find((document) => document.id === selectedId);
  const projects = [...new Set(documents.map((document) => document.project))];
  const sites = [...new Set(documents.map((document) => document.site))];
  const filteredDocuments = useMemo(
    () =>
      documents.filter(
        (document) =>
          (projectFilter === "All projects" ||
            document.project === projectFilter) &&
          (siteFilter === "All sites" || document.site === siteFilter) &&
          (categoryFilter === "All categories" ||
            document.category === categoryFilter),
      ),
    [categoryFilter, documents, projectFilter, siteFilter],
  );

  const upload = () => {
    if (!asset || !category) {
      dialog.show(
        "Document details required",
        "Select a document and choose its category before uploading.",
      );
      return;
    }
    onUpload({
      ...asset,
      project: "Palm Grove Residence",
      site: "Villa 18",
      category,
    });
    setAsset(null);
    setCategory("");
    dialog.show(
      "Document uploaded",
      "The document was added to the local site document list.",
    );
  };

  const preview = async (document: SiteDocument) => {
    if (!document.uri) {
      dialog.show(
        "Preview unavailable",
        "This demonstration document does not have a local source file. Upload a document to preview it.",
      );
      return;
    }
    try {
      const supported = await Linking.canOpenURL(document.uri);
      if (supported) {
        await Linking.openURL(document.uri);
        return;
      }
    } catch {
      // Fall through to the system application chooser.
    }
    dialog.show(
      "Viewer required",
      "This file type cannot be previewed directly. You can try opening it with another installed application.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Open with...",
          onPress: () => void download(document),
        },
      ],
    );
  };

  const download = async (document: SiteDocument) => {
    if (!document.uri) {
      dialog.show(
        "Download unavailable",
        "This demonstration document does not have a downloadable local file.",
      );
      return;
    }
    await Share.share({
      title: document.name,
      message: document.name,
      url: document.uri,
    });
  };

  if (selected) {
    return (
      <ScrollView contentContainerStyle={sheetStyles.list}>
        <Pressable
          onPress={() => setSelectedId(null)}
          style={sheetStyles.backAction}
        >
          <FontAwesome6 name="arrow-left" size={13} color={colors.primary} />
          <Text style={sheetStyles.backActionText}>Back to documents</Text>
        </Pressable>
        <Surface style={sheetStyles.documentDetailCard}>
          <View style={sheetStyles.documentPreviewIcon}>
            <FontAwesome6
              name={documentIcon(selected)}
              size={34}
              color={colors.primary}
            />
          </View>
          <Text style={sheetStyles.documentDetailName}>{selected.name}</Text>
          <Text style={sheetStyles.itemMeta}>{selected.category}</Text>
          <View style={sheetStyles.documentInfoList}>
            <Info icon="building" label="PROJECT" value={selected.project} />
            <Info icon="location-dot" label="SITE" value={selected.site} />
            <Info
              icon="calendar-days"
              label="UPLOADED"
              value={formatDateTime(selected.uploadedAt)}
            />
            <Info
              icon="hard-drive"
              label="FILE SIZE"
              value={formatSize(selected.size)}
            />
          </View>
        </Surface>
        <View style={sheetStyles.documentActions}>
          <Pressable
            onPress={() => void preview(selected)}
            style={sheetStyles.documentSecondaryAction}
          >
            <FontAwesome6 name="eye" size={15} color={colors.primary} />
            <Text style={sheetStyles.documentSecondaryActionText}>Preview</Text>
          </Pressable>
          <Pressable
            onPress={() => void download(selected)}
            style={sheetStyles.documentPrimaryAction}
          >
            <FontAwesome6 name="download" size={15} color={colors.white} />
            <Text style={sheetStyles.documentPrimaryActionText}>Download</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={sheetStyles.list}>
      <View style={sheetStyles.documentUploadCard}>
        <AttachmentPicker
          value={asset?.name ?? null}
          onChange={() => undefined}
          onAssetChange={setAsset}
          label="Select document"
        />
        <DropdownField
          value={category}
          placeholder="Select document category"
          options={categories}
          onChange={setCategory}
        />
        <PrimaryButton
          label="Upload document"
          icon="cloud-arrow-up"
          onPress={upload}
        />
      </View>

      <Text style={sheetStyles.listHeading}>FILTER DOCUMENTS</Text>
      <DropdownField
        value={projectFilter}
        placeholder="Filter by project"
        options={["All projects", ...projects]}
        onChange={setProjectFilter}
      />
      <View style={sheetStyles.splitFields}>
        <View style={sheetStyles.splitField}>
          <DropdownField
            value={siteFilter}
            placeholder="Filter by site"
            options={["All sites", ...sites]}
            onChange={setSiteFilter}
          />
        </View>
        <View style={sheetStyles.splitField}>
          <DropdownField
            value={categoryFilter}
            placeholder="Filter by category"
            options={["All categories", ...categories]}
            onChange={setCategoryFilter}
          />
        </View>
      </View>

      <Text style={sheetStyles.listHeading}>
        SITE DOCUMENTS ({filteredDocuments.length})
      </Text>
      <Surface style={sheetStyles.card}>
        {filteredDocuments.map((document, index) => (
          <View key={document.id}>
            {index ? <View style={sheetStyles.divider} /> : null}
            <Pressable
              onPress={() => setSelectedId(document.id)}
              style={sheetStyles.document}
            >
              <View style={sheetStyles.itemIcon}>
                <FontAwesome6
                  name={documentIcon(document)}
                  size={17}
                  color={colors.primary}
                />
              </View>
              <View style={sheetStyles.flex}>
                <Text style={sheetStyles.itemTitle}>{document.name}</Text>
                <Text style={sheetStyles.itemMeta}>
                  {document.project} · {document.site}
                </Text>
                <Text style={sheetStyles.itemMeta}>
                  {document.category} · {formatDateTime(document.uploadedAt)}
                </Text>
              </View>
              <FontAwesome6
                name="chevron-right"
                size={13}
                color={colors.inkMuted}
              />
            </Pressable>
          </View>
        ))}
        {filteredDocuments.length === 0 ? (
          <Text style={sheetStyles.documentEmpty}>No matching documents.</Text>
        ) : null}
      </Surface>
    </ScrollView>
  );
}

function formatSize(size?: number) {
  if (!size) return "Not available";
  if (size < 1024 * 1024) return `${Math.ceil(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function documentIcon(document: SiteDocument): FontAwesomeIcon {
  const mimeType = document.mimeType?.toLowerCase() ?? "";
  const extension = document.name.split(".").pop()?.toLowerCase() ?? "";
  if (
    mimeType.startsWith("image/") ||
    ["jpg", "jpeg", "png", "webp", "heic"].includes(extension)
  ) {
    return "file-image";
  }
  if (
    mimeType.startsWith("video/") ||
    ["mp4", "mov", "m4v", "avi"].includes(extension)
  ) {
    return "file-video";
  }
  if (
    mimeType.startsWith("audio/") ||
    ["mp3", "wav", "m4a", "aac"].includes(extension)
  ) {
    return "file-audio";
  }
  if (extension === "pdf" || mimeType === "application/pdf") return "file-pdf";
  if (["doc", "docx", "odt", "rtf"].includes(extension)) return "file-word";
  if (["xls", "xlsx", "csv", "ods"].includes(extension)) return "file-excel";
  if (["ppt", "pptx", "odp"].includes(extension)) return "file-powerpoint";
  if (["zip", "rar", "7z", "tar", "gz"].includes(extension))
    return "file-zipper";
  return "file";
}
