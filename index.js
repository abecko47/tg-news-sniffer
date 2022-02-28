const { Api, TelegramClient } = require("telegram");
const { StoreSession } = require("telegram/sessions");
const input = require("input");
const {NewMessage} = require("telegram/events");

const apiId = 932247;
const apiHash = "d77274ab0b6e86a3550058aab1d34c91";
const storeSession = new StoreSession("newsenws");

(async () => {
    console.log("WELL CUM to news sniffer");
    const client = new TelegramClient(storeSession, apiId, apiHash, {
        connectionRetries: 5,
    });
    await client.start({
        phoneNumber: async () => await input.text("Please enter your number: "),
        password: async () => await input.text("Please enter your password: "),
        phoneCode: async () =>
            await input.text("Please enter the code you received: "),
        onError: (err) => console.log(err),
    });
    console.log("You should now be connected.");
    client.session.delete(); // Save this string to avoid logging in again

    const eventPrint = async (event) => {
        const message = event.message;

        if (event.originalUpdate.className === 'UpdateNewChannelMessage') {
            // console.log({a: message, e: message})

            const channelFrom = await client.invoke(
                new Api.channels.GetChannels({
                    id: [message.peerId],
                })
            );

            console.log({a:message.media})
            if (message.media !== null) {
                let size = 10000;
                for (let sizeCandidate of message.media.photo.sizes) {
                    if (sizeCandidate.type['x']) {
                        size = sizeCandidate.size;
                        break;
                    }
                }

                const result = await client.invoke(
                    new Api.messages.GetDocumentByHash({
                        sha256: (message.media.photo.fileReference),
                        size: size,
                        mimeType: "image",
                    })
                );
                console.log(result); // prints the result
            }

            let requestData = {
                text: message.text,
                channel: channelFrom.chats[0].title,
                postId: message.id,
                grouped: message.groupedId !== null,
                groupedId: message.groupedId !== null ? message.groupedId.valueOf() : null,
                hasMedia: message.media !== null
            }

            console.log(requestData)
        }


    }

    client.addEventHandler(eventPrint, new NewMessage({}));

})();


