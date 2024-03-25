import type { GeneralFileType } from "@/types/general.ts";

export function useFile() {
  function humanReadableFileSize(sizeInBytes: number) {
    const i = sizeInBytes === 0 ? 0 : Math.floor(Math.log(sizeInBytes) / Math.log(1024));
    return Number( (sizeInBytes / Math.pow(1024, i)).toFixed(2) ) + ' ' + ["B", "kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][i];
  }
  function getGeneralTypeFromFile(file: File): GeneralFileType {
    const type = file.type;
    const fileType = type.split("/")[0];

    switch (fileType) {
      case "video":
        return "video";
      case "audio":
        return "audio";
      case "image":
        return "image";
      default:
        return "file";
    }
  }
  function getIconBasedOnFileType(file: File) {
    const type = getGeneralTypeFromFile(file);
    switch (type) {
      case "video":
        return "mdi-video-box";
      case "audio":
        return "mdi-music-box";
      case "image":
        return "mdi-image";
      default:
        return "mdi-file";
    }
  }

  function convertBlobToFile(blob: Blob, fileName: string): File {
    return new File([blob], fileName, {
      type: blob.type,
    });
  }

  return {
    humanReadableFileSize,
    getIconBasedOnFileType,
    getGeneralTypeFromFile,
    convertBlobToFile,
  };
}
