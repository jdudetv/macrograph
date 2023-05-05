import { core } from "../models";
import { types } from "../types";
import { invoke } from "@tauri-apps/api/tauri";

// import { fetch, Body } from "tauri-plugin-http-api";


const pkg = core.createPackage<any>({ name: "Discord" });
export const LSTokenName = "discordBotToken"
const Token = localStorage.getItem(LSTokenName);

const DiscURL = "https://discord.com/api/";
const DiscHeader = "{\"Content-Type\":\"application/json\",\"Authorization\":\"Bot \"" + Token + "\" \"}";



const ws = new WebSocket("wss://gateway.discord.gg/?v=6&encoding=json");

const fetchTypes = {
    POST: 'POST',
    GET: 'GET',
    PATCH: 'PATCH'
}

if (Token) {

    var interval = 0;
    var token = Token;

    const payload = {
        op: 2,
        d: {
            token: token,
            intents: 33280,
            properties: {
                $os: "linux",
                $browser: "chrome",
                $device: "chrome",
            },
        },
    };

    ws.addEventListener("open", function open(x) {
        ws.send(JSON.stringify(payload));
    });

    let seq;
    ws.addEventListener("message", function incoming(data) {
        let x = data.data;
        let payload = JSON.parse(x);

        const { t, event, op, d, s } = payload;
        seq = s;
        switch (op) {
            // OPCODE 10 GIVES the HEARTBEAT INTERVAL, SO YOU CAN KEEP THE CONNECTION ALIVE
            case 10:
                const { heartbeat_interval } = d;
                ws.send(JSON.stringify({ op: 1, d: null }));
                setInterval(() => {
                    ws.send(JSON.stringify({ op: 1, d: seq }));
                }, heartbeat_interval);

                break;
        }

        switch (t) {
            // IF MESSAGE IS CREATED, IT WILL LOG IN THE CONSOLE
            case "MESSAGE_CREATE":
                console.log(d.type);
                if (d.type !== 0) return;
                pkg.emitEvent({
                    name: "discordMessage",
                    data: d,
                })

        }
    });

}

async function SendMessage(urlEnd: string, body: any, type: string) {
    const URL = `https://discordapp.com/api/v10/channels/${urlEnd}`
    const response = await fetch(URL, {
        method: type,
        body: type == fetchTypes.POST || type == fetchTypes.PATCH ? JSON.stringify(body) : null,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bot ${Token}`,
        },
    });
    return response;
}

pkg.createNonEventSchema({
    name: "Send Discord Message",
    variant: "Exec",
    generateIO: (t) => {
        t.execInput({
            id: "exec",
        });
        t.dataInput({
            id: "message",
            name: "Message",
            type: types.string()
        });
        t.dataInput({
            id: "channel",
            name: "Channel ID",
            type: types.string()
        })
    },
    async run({ ctx }) {
        const urlEnd = `${ctx.getInput("channel")}/messages`;
        await SendMessage(urlEnd, { content: ctx.getInput("message") }, fetchTypes.POST);
        ctx.exec("exec");
    }
})

pkg.createNonEventSchema({
    name: "Get Discord User",
    variant: "Exec",
    generateIO: (t) => {
        t.execInput({
            id: "exec",
        });
        t.dataInput({
            id: "userId",
            name: "User ID",
            type: types.string()
        });
        t.dataOutput({
            id: "userName",
            name: "UserName",
            type: types.string()
        });
        t.dataOutput({
            id: "profile",
            name: "UserName",
            type: types.string()
        });
    },
    async run({ ctx }) {
        let data = JSON.parse(await (invoke('http', { url: `${DiscURL}users/${ctx.getInput("userId")}`, headers: DiscHeader })));
        console.log(data);
        ctx.setOutput("userName", data.username);
        ctx.setOutput("userName", data.username);
        //     https://cdn.discordapp.com/avatars/103733084150591488/91bc8e9f59a70d9a1829b626c60e8d56
        // }
    })

pkg.createEventSchema({
    name: "Discord Message",
    event: "discordMessage",
    generateIO: (t) => {
        t.execOutput({
            id: "exec",
        });
        t.dataOutput({
            id: "message",
            name: "Message",
            type: types.string(),
        });
        t.dataOutput({
            id: "channelId",
            name: "Channel ID",
            type: types.string(),
        });
        t.dataOutput({
            id: "username",
            name: "Username",
            type: types.string(),
        });
        t.dataOutput({
            id: "userId",
            name: "User ID",
            type: types.string(),
        });
        t.dataOutput({
            id: "nickname",
            name: "Nickname",
            type: types.string(),
        });
        t.dataOutput({
            id: "roles",
            name: "Roles",
            type: types.list(types.string()),
        });
    },
    run({ ctx, data }) {
        console.log(data);
        ctx.setOutput("message", data.content);
        ctx.setOutput("channelId", data.channel_id);
        ctx.setOutput("username", data.author.username);
        ctx.setOutput("userId", data.author.id);
        ctx.setOutput("nickname", data.member.nick);
        ctx.setOutput("roles", data.member.roles);
        ctx.exec("exec");
    }
});