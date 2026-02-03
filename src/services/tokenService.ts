import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import defaultTokens from "@/styles/design-tokens.json";

export interface DesignTokens {
    themeName: string;
    colors: {
        [key: string]: string;
    };
    spacing: {
        base: string;
        scale: number;
    };
    typography: {
        "font-sans": string;
        "font-heading": string;
    };
}

export const fetchTokens = async (): Promise<DesignTokens> => {
    try {
        // Attempt to fetch the 'active_theme' document from 'themes' collection
        // This assumes you have a collection 'themes' and a doc 'active_theme'
        const docRef = doc(db, "themes", "active_theme");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as DesignTokens;
        } else {
            console.warn("No active theme found in Firestore, using default tokens.");
            return defaultTokens;
        }
    } catch (error) {
        console.error("Error fetching tokens from Firestore:", error);
        return defaultTokens;
    }
};
