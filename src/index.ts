import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import 'dotenv/config'
import mongoose from "mongoose";

const quoteSchema = new mongoose.Schema({
    quote: String,
    author: String
});

const Quote = mongoose.model('Quote', quoteSchema);

if(process.env.MONGO_URI)
    mongoose.connect(process.env.MONGO_URI)

const app = new Hono()
app.use('*', logger())
app.use('*', cors({
    origin: (origin) => {
        if(process.env.NODE_ENV == 'development')
            return '*'
        else {
            let url = new URL(origin)
            return url.hostname.endsWith('projects.yasakdogra.com') ? origin : ''
        }
    }
}))

app.get('/', async (c) => {
    const tmp = await Quote.aggregate().sample(1).exec()
    return c.json({text: tmp[0]['quote'], author: tmp[0]['author']})
})

export default app
