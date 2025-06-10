//  create a script seed categories to the database
import { db } from "@/db";
import { categories } from "@/db/schema";

const categoryNames = [
    "Film & Animation",
    "Autos & Vehicles",
    "Music",
    "Pets & Animals",
    "Sports",
    "Short Movies",
    "Travel & Events",
    "Gaming",
    "People & Blogs",
    "Comedy",
    "Entertainment",
    "News & Politics",
    "Howto & Style",
    "Education",
    "Science & Technology",
    "Movies",
    "Documentary",
    "Drama",
    "Family",
    "Horror",
    "Sci-Fi/Fantasy",
    "Shorts",
    "Shows",
    "Trailers"
]

async function main() {
    console.log("Seeding categories...");
    try {
        const values = categoryNames.map(name => ({
            name,
            description: `Videos related to ${name.toLowerCase()}`,
        }));
        // Check if the categories table already exists
        const existingCategories = await db.select().from(categories);
        if (existingCategories.length > 0) {
            console.log("Categories already exist. Skipping seed.");
            return;
        }
        // Insert categories into the database
        await db.insert(categories).values(values);
        // Log the inserted categories
        values.forEach(category => {
            console.log(`Inserted category: ${category.name}`);
        });
        console.log("Categories seeded successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding categories:", error);
        process.exit(1);
    }
}

main()

// If you want to check for existing categories before inserting
// for (const name of categoryNames) {
//     const existingCategory = await db
//         .select()
//         .from(categories)
//         .where(categories.name.eq(name))
//         .limit(1)
//         .executeTakeFirst();
//     if (!existingCategory) {
//         await db.insert(categories).values({
//             name,
//             description: `Category for ${name}`,
//         });
//         console.log(`Inserted category: ${name}`);
//     } else {
//         console.log(`Category already exists: ${name}`);
//     }
// }
// If you want to log a success message
// after all categories are inserted
// console.log("All categories seeded successfully.");
// If you want to exit the process after seeding
// process.exit(0);

// if (!existingCategory) {
//     await db.insert(categories).values({
//         name,
//         description: `Category for ${name}`,
//     });
//     console.log(`Inserted category: ${name}`);
// // } else {
//     console.log(`Category already exists: ${name}`);
// // }