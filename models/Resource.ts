export class Resource {
    id: String
    name: String
    location: String
    description: String
    owner: String
  constructor(
    name: String,
    location: String,
    description: String,
    owner: String
  ) {
    this.name = name;
    this.location = location;
    this.description = description;
    this.owner = owner;
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    this.id = timestamp + "" + random.toString().padStart(3, "0");
  }
}
