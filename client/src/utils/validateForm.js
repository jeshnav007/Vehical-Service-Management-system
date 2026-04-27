export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validatePhone = (phone) => {
  const regex = /^\d{10}$/; // Basic strict 10 digits
  return regex.test(phone.replace(/\D/g, ''));
};

export const validateRequired = (fields) => {
  const errors = [];
  Object.keys(fields).forEach(key => {
    if (!fields[key] || fields[key].toString().trim() === '') {
      errors.push(`${key} is strictly required.`);
    }
  });
  return errors;
};
