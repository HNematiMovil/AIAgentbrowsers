import { promises as fs } from 'fs';
import FormData from 'form-data';
import path from 'path';
import { createReadStream } from 'fs';

/**
 * BaleBot - Helper class for interacting with Bale Messenger Bot API
 * Based on Telegram Bot API
 */
export class BaleBot {
  constructor(token) {
    if (!token) {
      throw new Error('Bot token is required');
    }
    this.token = token;
    this.baseUrl = `https://tapi.bale.ai/bot${token}`;
  }

  /**
   * Make a request to Bale API
   */
  async makeRequest(method, data = {}, useFormData = false) {
    const url = `${this.baseUrl}/${method}`;

    try {
      let response;

      if (useFormData) {
        // Use FormData for file uploads
        // Get headers from FormData (includes boundary)
        const headers = data.getHeaders ? data.getHeaders() : {};
        
        response = await fetch(url, {
          method: 'POST',
          headers: headers,
          body: data
        });
      } else {
        // Use JSON for regular requests
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
      }

      const result = await response.json();

      if (!result.ok) {
        throw new Error(result.description || 'API request failed');
      }

      return result.result;
    } catch (error) {
      console.error(`Bale API error (${method}):`, error.message);
      throw error;
    }
  }

  /**
   * Send a text message
   */
  async sendMessage(chatId, text, options = {}) {
    return await this.makeRequest('sendMessage', {
      chat_id: chatId,
      text: text,
      ...options
    });
  }

  /**
   * Send a photo from a file path
   */
  async sendPhoto(chatId, photoPath, options = {}) {
    try {
      // Check if file exists
      await fs.access(photoPath);

      const fileName = path.basename(photoPath);
      console.log(`Sending photo: ${fileName} to chat ${chatId}`);

      // Create FormData
      const formData = new FormData();
      formData.append('chat_id', String(chatId));
      
      // Use createReadStream instead of buffer for better compatibility
      formData.append('photo', createReadStream(photoPath), {
        filename: fileName,
        contentType: 'image/png'
      });

      // Add optional parameters
      if (options.caption) {
        formData.append('caption', options.caption);
      }
      if (options.parse_mode) {
        formData.append('parse_mode', options.parse_mode);
      }
      if (options.reply_markup) {
        formData.append('reply_markup', JSON.stringify(options.reply_markup));
      }

      return await this.makeRequest('sendPhoto', formData, true);
    } catch (error) {
      console.error('Error sending photo:', error.message);
      throw error;
    }
  }

  /**
   * Send a document/file
   */
  async sendDocument(chatId, documentPath, options = {}) {
    try {
      await fs.access(documentPath);

      const fileBuffer = await fs.readFile(documentPath);
      const fileName = path.basename(documentPath);

      const formData = new FormData();
      formData.append('chat_id', chatId);
      formData.append('document', fileBuffer, {
        filename: fileName
      });

      if (options.caption) {
        formData.append('caption', options.caption);
      }

      return await this.makeRequest('sendDocument', formData, true);
    } catch (error) {
      console.error('Error sending document:', error.message);
      throw error;
    }
  }

  /**
   * Get bot information
   */
  async getMe() {
    return await this.makeRequest('getMe');
  }

  /**
   * Get updates
   */
  async getUpdates(options = {}) {
    return await this.makeRequest('getUpdates', options);
  }

  /**
   * Send chat action (typing, upload_photo, etc.)
   */
  async sendChatAction(chatId, action) {
    return await this.makeRequest('sendChatAction', {
      chat_id: chatId,
      action: action
    });
  }
}

export default BaleBot;
