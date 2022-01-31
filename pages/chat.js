import { useState, useEffect } from "react";
import { Box, Text, TextField, Image, Button } from "@skynexui/components";
import React from "react";
import appConfig from "../config.json";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import { ButtonSendSticker } from "../src/components/ButtonSendSticker";
import { MessageList } from "../src/components/MessageList";

const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MzM0MTA2MSwiZXhwIjoxOTU4OTE3MDYxfQ.C9VwipsgS_zKoSyFe1i6KE0wJpOgKCuaCuU95Sn-VV0";

const SUPABASE_URL = "https://tlfzjbxjwvqlelqzsdgw.supabase.co";

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function escutaMensagensEmTempoReal(adicionaMensagem) {
  return (
    supabaseClient
      .from("mensagens")
      // O INSERT deve ser MAIÚSCULO.
      .on("INSERT", (respostaLive) => {
        adicionaMensagem(respostaLive.new);
      })
      .subscribe()
  );
}

export default function ChatPage() {
  const roteamento = useRouter();
  const usuarioLogado = roteamento.query.username;
  const [mensagem, setMensagem] = useState("");
  const [listaDeMensagens, setListaDeMensagens] = useState([]);

  function handleDeleteMensagem(mensagemAtual) {
    // Função para deletar mensagem
    supabaseClient
      .from("mensagens")
      .delete()
      .match({ id: mensagemAtual.id })
      .then(({ data }) => {
        const messagesListFiltered = listaDeMensagens.filter((mensagem) => {
          return mensagem.id != data[0].id;
        });
        setListaDeMensagens(messagesListFiltered);
      });
  }

  useEffect(() => {
    supabaseClient
      .from("mensagens")
      .select("*")
      .order("id", { ascending: false })
      .then(({ data }) => {
        setListaDeMensagens(data);
      });

    escutaMensagensEmTempoReal((novaMensagem) => {
      setListaDeMensagens((valorAtualDaLista) => {
        return [novaMensagem, ...valorAtualDaLista];
      });
    });
  }, []);

  function handleNovaMensagem(novaMensagem) {
    // Função para adicionar mensagem
    const mensagem = {
      de: usuarioLogado,
      texto: novaMensagem,
    };

    supabaseClient
      .from("mensagens")
      .insert([mensagem])
      .then(({ data }) => {});

    setMensagem("");
  }

  return (
    <Box
      styleSheet={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: appConfig.theme.colors.primary[500],
        backgroundImage: `url(https://cdnb.artstation.com/p/assets/images/images/024/538/827/original/pixel-jeff-clipa-s.gif?1582740711)`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundBlendMode: "multiply",
        color: appConfig.theme.colors.neutrals["000"],
      }}
    >
      <Box
        styleSheet={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          boxShadow: "0 2px 10px 0 rgb(0 0 0 / 20%)",
          borderRadius: "5px",
          backgroundColor: appConfig.theme.colors.neutrals[700],
          height: "100%",
          maxWidth: "95%",
          maxHeight: "95vh",
          padding: "32px",
        }}
      >
        <Header />
        <Box
          styleSheet={{
            position: "relative",
            display: "flex",
            flex: 1,
            height: "80%",
            backgroundColor: appConfig.theme.colors.neutrals[600],
            flexDirection: "column",
            borderRadius: "5px",
            padding: "16px",
          }}
        >
          <MessageList
            mensagens={listaDeMensagens}
            handleDeleteMensagem={handleDeleteMensagem}
          />

          <Box
            as="form"
            styleSheet={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <TextField
              textFieldColors={{
                neutral: {
                  backgroundColor: appConfig.theme.colors.primary["010"],
                  mainColor: appConfig.theme.colors.primary["010"],
                  mainColorHighlight: appConfig.theme.colors.primary["010"],
                  textColor: appConfig.theme.colors.primary["010"],
                },
                positive: {
                  backgroundColor: appConfig.theme.colors.primary["010"],
                  mainColor: appConfig.theme.colors.primary["010"],
                  mainColorHighlight: appConfig.theme.colors.primary["010"],
                  textColor: appConfig.theme.colors.primary["010"],
                },
                negative: {
                  backgroundColor: appConfig.theme.colors.primary["010"],
                  mainColor: appConfig.theme.colors.primary["010"],
                  mainColorHighlight: appConfig.theme.colors.primary["010"],
                  textColor: appConfig.theme.colors.primary["010"],
                },
              }}
              value={mensagem}
              onChange={() => {
                const valor = event.target.value;
                setMensagem(valor);
              }}
              onKeyPress={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleNovaMensagem(mensagem);
                }
              }}
              placeholder="Insira sua mensagem aqui..."
              type="textarea"
              styleSheet={{
                borderColor: "transparent",
                width: "100%",
                resize: "none",
                borderRadius: "5px",
                padding: "6px 8px",
                backgroundColor: appConfig.theme.colors.neutrals[800],
                marginRight: "6px",
                color: appConfig.theme.colors.neutrals[200],
              }}
            />
            <ButtonSendSticker
              onStickerClick={(sticker) => {
                handleNovaMensagem(":sticker: " + sticker);
              }}
            />

            {/* Botão de enviar mensagem  */}

            <Button
              onClick={() => {
                handleNovaMensagem(mensagem);
              }}
              label="Enviar mensagem"
              buttonColors={{
                contrastColor: appConfig.theme.colors.neutrals["100"],
                mainColor: appConfig.theme.colors.primary["020"],
                mainColorLight: appConfig.theme.colors.primary["010"],
                mainColorStrong: appConfig.theme.colors.primary["010"],
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function Header() {
  return (
    <>
      <Box
        styleSheet={{
          width: "100%",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text variant="heading5">Chat</Text>
        <Button
          variant="tertiary"
          colorVariant="neutral"
          label="Logout"
          href="/"
        />
      </Box>
    </>
  );
}
