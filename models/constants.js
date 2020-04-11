const USER = {
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
    FIRST_NAME: 'First name is required',
    LAST_NAME: 'First name is required',
    EMAIL: 'Email is required',
  },
};

const SERVICE = {
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
  },
  REQUIRED: {
    NAME: 'Name is required',
    PROVIDER_ID: 'Provider is required',
    CATEGORY: 'Category is required',
    PRICE: 'Price is required',
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
    SERVICE_ID: 'Service is required',
    PROVIDER_ID: 'Provider is required',
    CLIENT_ID: 'Client is required',
    DATE: 'Date is required',
    STATUS: 'Status is required',
  },
};

const REVIEW = {
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
    SERVICE_ID: 'Service is required',
    CLIENT_ID: 'Client is required',
    PROVIDER_ID: 'Provider is required',
    DATE: 'Date is required',
    RATING: 'Rating is required',
  },
};

const notValidMessage = field => ({ value }) => `${value} is not a valid ${field}`;

const notInEnumMessage = field => ({ value }) =>
  `\`${value}\` is not a valid enum value for path \`${field}\`.`;

const isNameValid = value => /^[a-zA-Z]+$/.test(value);

module.exports = {
  USER,
  SERVICE,
  APPOINTMENT,
  REVIEW,
  notValidMessage,
  notInEnumMessage,
  isNameValid,
};
