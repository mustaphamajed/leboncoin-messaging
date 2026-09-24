export type DeliveryStatus = 'sent' | 'sending' | 'waiting' | 'failed'

export type OutgoingStatus = Exclude<DeliveryStatus, 'sent'>
