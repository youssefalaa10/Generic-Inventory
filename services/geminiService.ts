import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { InvoiceData, ChatbotDataContext, RenewableData, RenewableCategory, DailyBriefingContext, PurchaseOrderSuggestionContext, SuggestedPurchaseOrderItem, FormulaSuggestionContext, NewProductIdeaContext, NewProductIdeaResponse, FormulaLine, Product } from '../types';

// IMPORTANT: This key is for demonstration purposes. 
// In a real application, it must be secured and managed via environment variables.
const API_KEY = "AIzaSyCbB3GwMrVtIDlWlmuE1wjvuMDoJeSK6r0";

if (!API_KEY) {
    console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function scanInvoiceWithGemini(base64Image: string, mimeType: string): Promise<InvoiceData> {
    if (!API_KEY) {
        // Simulate a successful response for environments without an API key
        console.log("Simulating Gemini API call because API_KEY is not set.");
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    vendor: "Simulated Vendor Inc.",
                    date: "2023-10-27",
                    amount: 199.99,
                });
            }, 1500);
        });
    }

    try {
        const imagePart = {
            inlineData: {
                mimeType: mimeType,
                data: base64Image,
            },
        };
        
        const textPart = {
            text: `From the invoice image, extract the vendor name, the invoice date (in YYYY-MM-DD format), and the total amount.`
        };

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        vendor: { type: Type.STRING, description: "The name of the vendor or company." },
                        date: { type: Type.STRING, description: "The invoice date formatted as YYYY-MM-DD." },
                        amount: { type: Type.NUMBER, description: "The total amount due." }
                    },
                    required: ["vendor", "date", "amount"]
                },
            }
        });
        
        const jsonString = response.text.trim();
        const data = JSON.parse(jsonString);

        return {
            vendor: data.vendor,
            date: data.date,
            amount: data.amount
        };

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to extract data from invoice using AI.");
    }
}

export async function scanRenewableWithGemini(base64Image: string, mimeType: string): Promise<RenewableData> {
    if (!API_KEY) {
        console.log("Simulating Gemini API renewable scan because API_KEY is not set.");
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    category: "Vehicle",
                    name: "تسجيل مركبة (محاكاة)",
                    identifier: "55-C-98765",
                    issueDate: "2024-01-01",
                    expiryDate: "2025-01-01",
                });
            }, 1500);
        });
    }

    try {
        const imagePart = {
            inlineData: {
                mimeType: mimeType,
                data: base64Image,
            },
        };
        
        const textPart = {
            text: `From the document image, extract the category (valid options are 'License', 'Vehicle', 'Permit', 'Subscription', 'Other'), the name of the item (e.g., 'Commercial License for General Trading' or 'Vehicle Insurance'), the main identifier (like license number or plate number), the issue date (in YYYY-MM-DD format), and the expiry date (in YYYY-MM-DD format).`
        };

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        category: { type: Type.STRING, description: "The category of the item. Must be one of: 'License', 'Vehicle', 'Permit', 'Subscription', 'Other'." },
                        name: { type: Type.STRING, description: "The specific name of the item, e.g., 'Commercial License'." },
                        identifier: { type: Type.STRING, description: "The license number, plate number, or other unique ID." },
                        issueDate: { type: Type.STRING, description: "The issue date formatted as YYYY-MM-DD." },
                        expiryDate: { type: Type.STRING, description: "The expiry date formatted as YYYY-MM-DD." }
                    }
                },
            }
        });
        
        const jsonString = response.text.trim();
        const data = JSON.parse(jsonString);

        const validCategories: RenewableCategory[] = ['License', 'Vehicle', 'Permit', 'Subscription', 'Other'];
        if (data.category && !validCategories.includes(data.category)) {
            data.category = 'Other'; 
        }
        
        return data;

    } catch (error) {
        console.error("Error calling Gemini API for renewable scan:", error);
        throw new Error("Failed to extract data from document using AI.");
    }
}


export async function getSalesForecastWithGemini(
    historicalData: { month: string; totalSales: number }[]
): Promise<{ forecast: { month: string; predictedSales: number }[]; analysis: string; }> {
    
    if (!API_KEY) {
        console.log("Simulating Gemini API forecast call because API_KEY is not set.");
        const lastMonth = historicalData.slice(-1)[0]?.month || '2024-07';
        const [year, month] = lastMonth.split('-').map(Number);
        const forecast = [];
        for (let i = 1; i <= 3; i++) {
            const d = new Date(year, month - 1 + i, 1);
            const nextMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            forecast.push({ month: nextMonth, predictedSales: Math.random() * 5000 + 15000 });
        }
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    forecast,
                    analysis: "This is a simulated analysis. The sales trend appears positive, with seasonal peaks expected in the upcoming holiday season. Marketing efforts should focus on popular product categories to maximize revenue."
                });
            }, 2000);
        });
    }

    try {
        const prompt = `You are a financial analyst for a retail business. Based on the following historical monthly sales data (in KWD), please forecast the sales for the next 3 months (the next quarter). Provide a brief, insightful text analysis of the trend, mentioning any potential factors or reasons for your prediction.

Historical Data: ${JSON.stringify(historicalData)}

Provide your response in a valid JSON object with the following exact structure: { "forecast": [ { "month": "YYYY-MM", "predictedSales": number }, ... ], "analysis": "Your text analysis here." }`;
        
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        forecast: {
                            type: Type.ARRAY,
                            description: "An array of objects, each representing a forecasted month.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    month: { type: Type.STRING, description: "The forecasted month in YYYY-MM format." },
                                    predictedSales: { type: Type.NUMBER, description: "The predicted sales amount for that month." }
                                },
                                required: ["month", "predictedSales"]
                            }
                        },
                        analysis: { 
                            type: Type.STRING,
                            description: "A brief text analysis of the sales forecast and trends."
                        }
                    },
                    required: ["forecast", "analysis"]
                }
            }
        });
        
        const jsonString = response.text.trim();
        return JSON.parse(jsonString);

    } catch (error) {
        console.error("Error calling Gemini API for sales forecast:", error);
        throw new Error("Failed to get sales forecast from AI.");
    }
}


export async function getDailyBriefing(context: DailyBriefingContext): Promise<string> {
    if (!API_KEY) {
        console.log("Simulating Gemini API daily briefing call because API_KEY is not set.");
        return new Promise(resolve => {
            setTimeout(() => {
                const briefing = `
### موجز الصباح لـ ${context.today} ☀️

**ملخص أداء الأمس:**
* **إجمالي المبيعات:** ${context.yesterdaySalesTotal.toLocaleString()} د.ك عبر ${context.yesterdayInvoiceCount} فاتورة.
* **المنتجات الأكثر مبيعاً:**
    * ${context.topSellingProducts[0]?.name || 'N/A'} (الكمية: ${context.topSellingProducts[0]?.quantity || 0})
    * ${context.topSellingProducts[1]?.name || 'N/A'} (الكمية: ${context.topSellingProducts[1]?.quantity || 0})

**تنبيهات هامة:**
* **مخزون منخفض:** يوجد **${context.lowStockItemsCount}** منتج وصل للحد الأدنى للمخزون. أهمها:
    * ${context.criticalLowStockItems[0]?.name || 'N/A'} (المتبقي: ${context.criticalLowStockItems[0]?.quantity || 0})
* **الموارد البشرية:** يوجد **${context.pendingHRRequests}** طلب معلق (إجازات، سلف، إلخ) بحاجة للمراجعة.
* **تجديدات قادمة:**
    * ${context.upcomingRenewals[0]?.name || 'N/A'} ينتهي خلال **${context.upcomingRenewals[0]?.daysUntilExpiry || 0}** يوم.

**اقتراح:**
* نظراً لأداء **${context.topSellingProducts[0]?.name || 'المنتج الأكثر مبيعاً'}** الجيد، قد يكون من الجيد التفكير في حملة تسويقية بسيطة له.
                `;
                resolve(briefing);
            }, 1500);
        });
    }

    const systemInstruction = `You are an expert AI business analyst named "Fahim". Your role is to provide a concise, actionable morning briefing for a manager based on the provided JSON data.
- The response MUST be in Arabic.
- Use Markdown for formatting (headings with '###', bold with '**', and lists with '* ').
- Start with a positive greeting and the current date.
- Summarize yesterday's performance clearly.
- Highlight critical alerts that need immediate attention (low stock, pending requests, renewals).
- Provide one simple, actionable suggestion based on the data.
- Keep the entire summary brief and easy to read in under 30 seconds.
- Do NOT invent any data not present in the context. If a section has no data (e.g., no low stock items), state that things look good in that area.`;

    const contents = `Here is the data for today's briefing. Today's date is ${context.today}. All monetary values are in KWD.

Data:
${JSON.stringify(context, null, 2)}

Generate the briefing now.`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
            },
        });
        
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API for daily briefing:", error);
        return "عذراً، لقد واجهت خطأ أثناء إنشاء الموجز اليومي. يرجى المحاولة مرة أخرى.";
    }
}


export async function getChatbotResponse(query: string, context: ChatbotDataContext): Promise<string> {
    if (!API_KEY) {
        console.log("Simulating Gemini Chatbot call because API_KEY is not set.");
        return new Promise(resolve => {
            setTimeout(() => {
                let responseText = "This is a simulated response. I can help with sales, inventory, and more.";
                if (query.toLowerCase().includes('sales')) {
                    responseText = `The total sales amount is ${context.sales.reduce((sum, s) => sum + s.totalAmount, 0).toLocaleString()} KWD.`;
                } else if (query.toLowerCase().includes('low stock')) {
                    const lowStockItems = context.inventory.filter(i => i.quantity <= i.minStock && i.minStock > 0);
                    responseText = `There are ${lowStockItems.length} items with low stock.`;
                }
                resolve(responseText);
            }, 1500);
        });
    }

    // Prepare a structured summary of the data for the AI.
    const contextForAI = {
        metrics: {
            totalSalesValue: context.sales.reduce((s, c) => s + c.totalAmount, 0),
            totalPurchasesValue: context.purchases.reduce((s, c) => s + c.amount, 0),
            numberOfSales: context.sales.length,
            numberOfCustomers: context.customers.length,
            numberOfEmployees: context.employees.length,
            numberOfProducts: context.products.length,
        },
        branches: context.branches.map(b => ({ id: b.id, name: b.name })),
        products: context.products.map(p => ({ id: p.id, name: p.name, price: p.unitPrice, category: p.category, baseUnit: p.baseUnit })),
        inventory: context.inventory.map(i => {
            const product = context.products.find(p => p.id === i.productId);
            return {
                productId: i.productId,
                productName: product?.name,
                branchId: i.branchId,
                quantity: i.quantity,
                minStock: i.minStock,
                isLow: i.quantity <= i.minStock && i.minStock > 0,
                expiryDate: i.expiryDate,
            }
        }),
        recentSales: context.sales.slice(-10).map(s => ({...s, items: s.items.length })), // don't send full item details
    };
    
    const systemInstruction = `You are an expert AI assistant named "Fahim" for a financial management system. Your purpose is to answer questions based ONLY on the JSON data provided.
- Be concise, friendly, and professional.
- Answer in Arabic.
- Do not make up information. If the answer is not in the provided data, say "لا يمكنني العثور على هذه المعلومة في البيانات الحالية."
- All monetary values are in KWD. Use the 'KWD' symbol or 'د.ك'.
- When asked for names (e.g., products, branches), use the names provided in the JSON data.
- Today's date is ${new Date().toISOString().split('T')[0]}.`;
    
    const contents = `Based on this data:\n${JSON.stringify(contextForAI, null, 2)}\n\nAnswer the following question: "${query}"`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
            },
        });
        
        return response.text;

    } catch (error) {
        console.error("Error calling Gemini API for chatbot:", error);
        return "عذراً، لقد واجهت خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.";
    }
}

export async function getPurchaseOrderSuggestion(
  context: PurchaseOrderSuggestionContext
): Promise<SuggestedPurchaseOrderItem[]> {
  if (!API_KEY) {
    console.log("Simulating Gemini API purchase order suggestion because API_KEY is not set.");
    return new Promise(resolve => {
      setTimeout(() => {
        const suggestions = context.inventory
          .filter(item => item.currentStock < item.salesVelocityPerDay * context.forecastDays || (item.currentStock <= item.minStock && item.minStock > 0))
          .map(item => ({
            productId: item.productId,
            productName: item.productName,
            sku: item.sku,
            currentStock: item.currentStock,
            recommendedQuantity: Math.ceil(item.salesVelocityPerDay * context.forecastDays - item.currentStock + item.minStock) || 10,
            reasoning: "محاكاة: مخزون منخفض ومعدل مبيعات مرتفع."
          }))
          .filter(item => item.recommendedQuantity > 0)
          .slice(0, 5); // Limit for demo
        resolve(suggestions);
      }, 2000);
    });
  }

  const systemInstruction = `You are an expert inventory management assistant for a perfume company. Your task is to analyze inventory data and generate intelligent purchase order suggestions.
- The user will provide a JSON object containing current inventory levels, minimum stock requirements, and the average daily sales velocity for each product in a specific branch.
- Analyze each product.
- Your primary goal is to recommend a 'recommendedQuantity' to reorder to ensure there is enough stock to cover sales for the specified 'forecastDays', plus maintain the minimum stock level. The formula is roughly: (salesVelocityPerDay * forecastDays) - currentStock + minStock.
- The reorder quantity should be a sensible, rounded integer. Avoid ordering tiny quantities unless necessary.
- For each recommendation, provide a brief, clear 'reasoning' in Arabic. Examples: "مخزون منخفض ومبيعات عالية", "على وشك النفاد بناءً على معدل المبيعات", "للوصول للحد الأدنى للمخزون".
- Only return items that actually need reordering (where recommended quantity > 0). Do not return items with sufficient stock.
- Your entire response MUST be a valid JSON array conforming to the provided schema.`;

  const contents = `Please generate purchase order suggestions for the "${context.branchName}" branch. We want to stock up for the next ${context.forecastDays} days.
  
  Current inventory data:
  ${JSON.stringify(context.inventory, null, 2)}
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              productId: { type: Type.NUMBER },
              productName: { type: Type.STRING },
              sku: { type: Type.STRING },
              currentStock: { type: Type.NUMBER },
              recommendedQuantity: { type: Type.NUMBER },
              reasoning: { type: Type.STRING, description: "Brief reason for the suggestion in Arabic." }
            },
            required: ["productId", "productName", "sku", "currentStock", "recommendedQuantity", "reasoning"]
          }
        }
      },
    });
    
    const jsonString = response.text.trim();
    return JSON.parse(jsonString);

  } catch (error) {
    console.error("Error calling Gemini API for purchase order suggestion:", error);
    throw new Error("Failed to get purchase order suggestion from AI.");
  }
}


export async function getFormulaSuggestion(context: FormulaSuggestionContext): Promise<FormulaLine[]> {
    if (!API_KEY) {
        console.log("Simulating Gemini formula suggestion.");
        return new Promise(resolve => setTimeout(() => resolve([
            { id: "1", materialId: 1, materialName: "زيت الورد الدمشقي", materialSku: "RM-OIL-001", kind: "AROMA_OIL", percentage: 40 },
            { id: "2", materialId: 3, materialName: "زيت المسك الأبيض", materialSku: "RM-OIL-003", kind: "AROMA_OIL", percentage: 30 },
            { id: "3", materialId: 7, materialName: "كحول عطور 96%", materialSku: "RM-CHEM-001", kind: "ETHANOL", percentage: 30 },
        ]), 1500));
    }

    const systemInstruction = `You are a master perfumer AI assistant. Your task is to create a perfume formula based on a user's description and a list of available raw materials with their stock levels.
- The formula percentages MUST add up to exactly 100.
- Only use materials from the provided 'rawMaterials' list. Match them by their 'id'.
- CRUCIAL: Prioritize using materials where 'availableQuantity' is greater than 0. You can use materials with 0 quantity if absolutely necessary for the fragrance profile, but it is highly preferred to use what is in stock.
- Provide sensible percentages.
- The 'kind' property should be logically derived from the material name (e.g., 'AROMA_OIL', 'ETHANOL', 'DI_WATER', 'FIXATIVE').
- Your entire response MUST be a valid JSON array conforming to the schema for FormulaLine[].
- Do not include materials with 0 percentage.`;
    
    const contents = `User Prompt: "${context.prompt}"\n\nAvailable Raw Materials: ${JSON.stringify(context.rawMaterials)}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            materialId: { type: Type.NUMBER },
                            materialName: { type: Type.STRING },
                            materialSku: { type: Type.STRING },
                            kind: { type: Type.STRING },
                            percentage: { type: Type.NUMBER },
                            density: { type: Type.NUMBER, nullable: true },
                        },
                        required: ["id", "materialId", "materialName", "materialSku", "kind", "percentage"]
                    }
                }
            }
        });
        const jsonString = response.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error calling Gemini API for formula suggestion:", error);
        throw new Error("Failed to get formula suggestion from AI.");
    }
}


export async function getNewProductIdea(context: NewProductIdeaContext): Promise<NewProductIdeaResponse> {
    if (!API_KEY) {
        console.log("Simulating Gemini new product idea.");
        return new Promise(resolve => setTimeout(() => resolve({
            productName: "Simulated Sunset Oud",
            fragranceNotes: {
                top: "Bergamot, Saffron",
                middle: "Rose, Geranium",
                base: "Oud, Amber, Musk",
            },
            formula: [
                { id: "1", materialId: 2, materialName: "زيت العود الكمبودي", materialSku: "RM-OIL-002", kind: "AROMA_OIL", percentage: 25 },
                { id: "2", materialId: 1, materialName: "زيت الورد الدمشقي", materialSku: "RM-OIL-001", kind: "AROMA_OIL", percentage: 15 },
                { id: "3", materialId: 7, materialName: "كحول عطور 96%", materialSku: "RM-CHEM-001", kind: "ETHANOL", percentage: 60 },
            ]
        }), 1500));
    }

    const systemInstruction = `You are a creative director and master perfumer AI. Your task is to invent a new perfume product idea based on a user's theme and a list of available raw materials with their stock levels.
- Create a compelling 'productName' in English.
- Describe the 'fragranceNotes' with top, middle, and base notes.
- Create a 'formula' for the perfume. The formula percentages MUST add up to exactly 100.
- Only use materials from the provided 'rawMaterials' list for the formula.
- CRUCIAL: The formula you create should strongly prioritize using materials where 'availableQuantity' is greater than 0. It should be based on what is actually in stock.
- Your entire response MUST be a valid JSON object conforming to the provided schema.`;

    const contents = `User Theme: "${context.prompt}"\n\nAvailable Raw Materials: ${JSON.stringify(context.rawMaterials)}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro', // Using a more creative model for this task
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        productName: { type: Type.STRING },
                        fragranceNotes: {
                            type: Type.OBJECT,
                            properties: {
                                top: { type: Type.STRING },
                                middle: { type: Type.STRING },
                                base: { type: Type.STRING },
                            },
                            required: ["top", "middle", "base"]
                        },
                        formula: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.STRING },
                                    materialId: { type: Type.NUMBER },
                                    materialName: { type: Type.STRING },
                                    materialSku: { type: Type.STRING },
                                    kind: { type: Type.STRING },
                                    percentage: { type: Type.NUMBER },
                                    density: { type: Type.NUMBER, nullable: true },
                                },
                                required: ["id", "materialId", "materialName", "materialSku", "kind", "percentage"]
                            }
                        }
                    },
                    required: ["productName", "fragranceNotes", "formula"]
                }
            }
        });
        const jsonString = response.text.trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error calling Gemini API for new product idea:", error);
        throw new Error("Failed to get new product idea from AI.");
    }
}