import Mux from '@mux/mux-node';

export const mux = new Mux({
    tokenId: process.env.MUX_TOKEN_ID,
    tokenSecret: process.env.MUX_TOKEN_SECRET,
    //   apiKey: process.env.MUX_API_KEY,
    //   apiSecret: process.env.MUX_API_SECRET,

});