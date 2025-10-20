FROM node:18

WORKDIR /app

# package.json und package-lock.json kopieren
COPY package*.json ./

# bcrypt sauber für ARM bauen
RUN npm install --build-from-source bcrypt

# Rest des Codes
COPY . .

EXPOSE 5000
CMD ["npm", "run", "dev"]
