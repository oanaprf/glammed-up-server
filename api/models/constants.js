const USER = {
  MODEL: 'user',
  FIELDS: {
    ID: '_id',
    FIRST_NAME: 'firstName',
    LAST_NAME: 'lastName',
    EMAIL: 'email',
    PHONE_NUMBER: 'phoneNumber',
    ADDRESS: 'address',
    IS_PROVIDER: 'isProvider',
    PROFILE_PICTURE: 'profilePicture',
  },
  REQUIRED: {
    FIRST_NAME: 'FIRST_NAME_REQUIRED',
    LAST_NAME: 'LAST_NAME_REQUIRED',
    EMAIL: 'EMAIL_REQUIRED',
  },
  NOT_VALID: {
    FIRST_NAME: 'FIRST_NAME_NOT_VALID',
    LAST_NAME: 'LAST_NAME_NOT_VALID',
    EMAIL: 'EMAIL_NOT_VALID',
    PHONE_NUMBER: 'PHONE_NUMBER_NOT_VALID',
  },
  MIN_LENGTH: {
    FIRST_NAME: 'FIRST_NAME_TOO_SHORT',
    LAST_NAME: 'LAST_NAME_TOO_SHORT',
    EMAIL: 'EMAIL_TOO_SHORT',
    ADDRESS: 'ADDRESS_TOO_SHORT',
  },
  MAX_LENGTH: {
    FIRST_NAME: 'FIRST_NAME_TOO_LONG',
    LAST_NAME: 'LAST_NAME_TOO_LONG',
    EMAIL: 'EMAIL_TOO_LONG',
    ADDRESS: 'ADDRESS_TOO_LONG',
  },
  VIRTUALS: {
    FULL_NAME: 'fullName',
    SERVICES: 'services',
  },
};

const SERVICE = {
  MODEL: 'service',
  FIELDS: {
    ID: '_id',
    NAME: 'name',
    PROVIDER_ID: 'providerId',
    CATEGORY: 'category',
    PRICE: 'price',
    DURATION: 'duration',
    AVERAGE_RATING: 'averageRating',
    PICTURES: 'pictures',
  },
  CATEGORY_ENUM: {
    NAILS: 'NAILS',
    MAKE_UP: 'MAKE_UP',
    HAIR: 'HAIR',
    EYELASHES: 'EYELASHES',
    EYEBROWS: 'EYEBROWS',
    FACIALS: 'FACIALS',
    WAXING: 'WAXING',
    MASSAGE: 'MASSAGE',
    OTHER: 'OTHER',
  },
  REQUIRED: {
    NAME: 'NAME_REQUIRED',
    PROVIDER_ID: 'PROVIDER_REQUIRED',
    CATEGORY: 'CATEGORY_REQUIRED',
    PRICE: 'PRICE_REQUIRED',
  },
  CATEGORY_NOT_IN_ENUM: 'CATEGORY_NOT_IN_ENUM',
  MIN: {
    PRICE: 'PRICE_TOO_SMALL',
    DURATION: 'DURATION_TOO_SMALL',
    AVERAGE_RATING: 'AVERAGE_RATING_TOO_SMALL',
  },
  MAX: {
    PRICE: 'PRICE_TOO_BIG',
    DURATION: 'DURATION_TOO_BIG',
    AVERAGE_RATING: 'AVERAGE_RATING_TOO_BIG',
  },
  VIRTUALS: {
    PROVIDER: 'provider',
    REVIEWS: 'reviews',
  },
};

const APPOINTMENT = {
  FIELDS: {
    ID: '_id',
    SERVICE_ID: 'serviceId',
    PROVIDER_ID: 'providerId',
    CLIENT_ID: 'clientId',
    DATE: 'date',
    STATUS: 'status',
  },
  STATUS_ENUM: {
    PENDING_APPROVAL: 'PENDING_APPROVAL',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
  },
  REQUIRED: {
    SERVICE_ID: 'SERVICE_REQUIRED',
    PROVIDER_ID: 'PROVIDER_REQUIRED',
    CLIENT_ID: 'CLIENT_REQUIRED',
    DATE: 'DATE_REQUIRED',
    STATUS: 'STATUS_REQUIRED',
  },
  STATUS_NOT_IN_ENUM: 'STATUS_NOT_IN_ENUM',
};

const REVIEW = {
  MODEL: 'review',
  FIELDS: {
    ID: '_id',
    SERVICE_ID: 'serviceId',
    CLIENT_ID: 'clientId',
    PROVIDER_ID: 'providerId',
    DATE: 'date',
    RATING: 'rating',
    COMMENT: 'comment',
  },
  REQUIRED: {
    SERVICE_ID: 'SERVICE_REQUIRED',
    CLIENT_ID: 'CLIENT_REQUIRED',
    PROVIDER_ID: 'PROVIDER_REQUIRED',
    DATE: 'DATE_REQUIRED',
    RATING: 'RATING_REQUIRED',
  },
  MIN: {
    RATING: 'RATING_TOO_SMALL',
  },
  MAX: {
    RATING: 'RATING_TOO_BIG',
  },
  MIN_LENGTH: { COMMENT: 'COMMENT_TOO_SHORT' },
  MAX_LENGTH: { COMMENT: 'COMMENT_TOO_LONG' },
  VIRTUALS: {
    SERVICE: 'service',
    PROVIDER: 'provider',
    CLIENT: 'client',
  },
};

const isNameValid = value => /^[a-zA-Z]+$/.test(value);

module.exports = {
  USER,
  SERVICE,
  APPOINTMENT,
  REVIEW,
  isNameValid,
};
