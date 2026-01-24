import React, { useState } from "react";
import {
    Box,
    Button,
    Typography,
    CircularProgress,
    Card,
    CardContent,
    Alert,
} from "@mui/material";
import axios from "axios";
import { useAuth } from "../AuthProvider";
import { useTranslation } from "react-i18next";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";

interface SummaryProps {
    entryId: string;
    changes: boolean;
    entry: {
        title: string | null;
        date: Date | null;
        description: string | null;
        transcribed_text?: string | null;
        summary_text?: string | null;
    };
    fetchEntry: () => void;
    setChanges: React.Dispatch<React.SetStateAction<boolean>>;
}

const Summary = ({ entryId, changes, entry, fetchEntry, setChanges }: SummaryProps) => {
    const { t } = useTranslation();
    const { token } = useAuth();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateSummary = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(
                `http://localhost:5001/api/transcriptions/${entryId}/summary`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                }
            );

            if (response.status === 200 && response.data.summary) {
                fetchEntry();
                setChanges(true);
            } else {
                setError(t("summaryGenerationError"));
            }
        } catch (err: any) {
            console.error("Fehler beim Generieren der Zusammenfassung:", err);
            if (err.response?.status === 400) {
                setError(t("summaryTextTooShort"));
            } else {
                setError(t("apiErrorSummary"));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card sx={{ my: 4, p: 2, maxWidth: 800 }}>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    {t("summary_title")}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                    {t("summary_minimum_words")}
                </Typography>
                <Button
                    variant="contained"
                    color="success"
                    onClick={generateSummary}
                    disabled={
                        loading ||
                        !entry.transcribed_text ||
                        entry.transcribed_text.split(" ").length < 50 ||
                        changes ||
                        !!entry.summary_text
                    }
                    fullWidth
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoFixHighIcon />}
                >
                    {loading ? t("generating_summary") : t("generate_summary")}
                </Button>

                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}

                {(entry.summary_text || entry.summary_text === "") && (
                    <Box sx={{ mt: 3, p: 2, border: "1px solid #ccc", borderRadius: 1 }}>
                        <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                            {entry.summary_text || ""}
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default Summary;