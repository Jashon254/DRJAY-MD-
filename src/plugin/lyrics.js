import axios from 'axios';
import pkg, { prepareWAMessageMedia } from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto } = pkg;

const Lyrics = async (m, Matrix) => {
  const prefixMatch = m.body.match(/^[\\/!#.]/);
  const prefix = prefixMatch ? prefixMatch[0] : '/';
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  const validCommands = ['lyrics', 'lyric'];

  if (validCommands.includes(cmd)) {
    if (!text) return m.reply(`Hello *_${m.pushName}_,*\n Here's Example Usage: _.lyrics lucid dreams|Juice wrld._`);

    try {
      await m.React('🕘');
      await m.reply('A moment, *DRJAY 𝐌𝐃* is generating your lyrics request...');

      if (!text.includes('|')) {
        return m.reply('Please provide the song name and artist name separated by a "|", for example: Spectre|Alan Walker.');
      }

      const [title, artist] = text.split('|').map(part => part.trim());

      if (!title || !artist) {
        return m.reply('Both song name and artist name are required. Please provide them in the format: song name|artist name.');
      }

      const apiUrl = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
      const response = await axios.get(apiUrl);
      const result = response.data;

      if (result && result.lyrics) {
        const lyrics = result.lyrics;

        let buttons = [{
            name: "cta_copy",
            buttonParamsJson: JSON.stringify({
              display_text: "📋 ᴄᴏᴘʏ ʟʏʀɪᴄs",
              id: "copy_code",
              copy_code: lyrics
            })
          },
          {
            name: "cta_url",
            buttonParamsJson: JSON.stringify({
              display_text: "sʜᴏᴡ 💜 ғᴏʀ 𝐓𝐑𝐄𝐗 𝐌𝐃",
              url: `https://whatsapp.com/channel/0029VaWJMi3GehEE9e1YsI1S`
            })
          },
          {
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
              display_text: "ᴍᴀɪɴ ᴍᴇɴᴜ",
              id: ".menu"
            })
          }
        ];

        let msg = generateWAMessageFromContent(m.from, {
          viewOnceMessage: {
            message: {
              messageContextInfo: {
                deviceListMetadata: {},
                deviceListMetadataVersion: 2
              },
              interactiveMessage: proto.Message.InteractiveMessage.create({
                body: proto.Message.InteractiveMessage.Body.create({
                  text: lyrics
                }),
                footer: proto.Message.InteractiveMessage.Footer.create({
                  text: "> *© 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 DRJAY 𝐌𝐃*"
                }),
                header: proto.Message.InteractiveMessage.Header.create({
                  title: "",
                  subtitle: "",
                  hasMediaAttachment: false
                }),
                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                  buttons: buttons
                })
              })
            }
          }
        }, {});

        await Matrix.relayMessage(msg.key.remoteJid, msg.message, {
          messageId: msg.key.id
        });

        await m.React('✅');
      } else {
        throw new Error('Invalid response from the Lyrics API.');
      }
    } catch (error) {
      console.error('Error getting lyrics:', error.message);
      m.reply('Error getting lyrics.');
      await m.React('❌');
    }
  }
};

export default Lyrics;
