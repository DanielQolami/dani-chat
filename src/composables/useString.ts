import { useDateFormat } from "@vueuse/core";

export function useString() {
  function removeDoubleQuotes(str: string): string {
    return str.replace(/(")+/g, "");
  }

  /**
   * this function uses `useDateFormat`, underneath. it returns the formatted date as string without quotation marks.
   * @param date
   * @param options {object} defaults: dateFormat = "YYYY-MM-DD"
   */
  function formatDate(date: string | number | Date, options?: { dateFormat?: string, locales?: string }): string {
    if (!date) return "";

    const config = {
      dateFormat: options?.dateFormat || "YYYY-MM-DD",
      locales: options?.locales || "en-US",
    };
    // console.log(removeDoubleQuotes(useDateFormat(date, dateFormat).value));
    return removeDoubleQuotes(useDateFormat(date, config.dateFormat, { locales: config.locales }).value);
  }

  const getBase64FromUrl = async (url: string): Promise<string | ArrayBuffer| null> => {
    try {
      const data = await fetch(url);
      const blob = await data.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64data = reader.result;
          resolve(base64data);
        }
      });
    }
    catch (error) {
      // console.log(error);
      return null;
    }
  }

  return {
    removeDoubleQuotes,
    formatDate,
    getBase64FromUrl,
  };
}
