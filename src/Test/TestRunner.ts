import { tests } from "./TestRegister";

function main(): void {
    const name = process.argv[2];
    if (!name) {
        console.error("Usage: npm test <name>");
        console.error(`Available: ${tests.join(", ")}`);
        process.exit(1);
    }
    if (!tests.includes(name)) {
        console.error(`Unknown test "${name}".`);
        console.error(`Available: ${tests.join(", ")}`);
        process.exit(1);
    }
    require(`@Test/Controller/${name}`);
}
main();