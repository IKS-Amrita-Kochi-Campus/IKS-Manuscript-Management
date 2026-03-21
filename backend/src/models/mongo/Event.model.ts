import { Schema, Model } from 'mongoose';
import { getMongoManuscriptsConnection } from '../../config/database.js';

export interface IEvent {
    _id?: string;
    title: string;
    description?: string;
    date: Date;
    images: string[];
    createdAt: Date;
    updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        description: {
            type: String,
            trim: true,
        },
        date: {
            type: Date,
            required: true,
            index: true,
        },
        images: [
            {
                type: String,
                trim: true,
            },
        ],
    },
    {
        timestamps: true,
        collection: 'events',
    }
);

// Index for sorting by date descending (most common query)
EventSchema.index({ date: -1 });

// Cache the model instance
let cachedModel: Model<IEvent> | null = null;

export function getEventModel(): Model<IEvent> {
    if (!cachedModel) {
        const connection = getMongoManuscriptsConnection();
        cachedModel = connection.model<IEvent>('Event', EventSchema);
    }
    return cachedModel;
}
