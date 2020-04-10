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
  CATEGORIES: {
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

const notValidMessage = field => ({ value }) => `${value} is not a valid ${field}`;

const notInEnumMessage = field => ({ value }) =>
  `\`${value}\` is not a valid enum value for path \`${field}\`.`;

const isNameValid = value => /^[a-zA-Z]+$/.test(value);

module.exports = {
  USER,
  SERVICE,
  notValidMessage,
  notInEnumMessage,
  isNameValid,
};
