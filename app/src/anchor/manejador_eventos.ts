/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/manejador_eventos.json`.
 */
export type ManejadorEventos = {
  "address": "WAEdkGnMEj3nvktbFLR2eb6uHDEFo5EEbRrfvydPzi8",
  "metadata": {
    "name": "manejadorEventos",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "comprarEntradaEvento",
      "discriminator": [
        95,
        118,
        180,
        207,
        81,
        44,
        48,
        75
      ],
      "accounts": [
        {
          "name": "evento",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "evento.id",
                "account": "evento"
              },
              {
                "kind": "const",
                "value": [
                  101,
                  118,
                  101,
                  110,
                  116,
                  111
                ]
              },
              {
                "kind": "account",
                "path": "evento.autoridad",
                "account": "evento"
              }
            ]
          }
        },
        {
          "name": "cuentaCompradorTokenAceptado",
          "writable": true
        },
        {
          "name": "bovedaGanancias",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  118,
                  101,
                  100,
                  97,
                  95,
                  103,
                  97,
                  110,
                  97,
                  110,
                  99,
                  105,
                  97,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "evento"
              }
            ]
          }
        },
        {
          "name": "comprador",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "cantidad",
          "type": "u64"
        }
      ]
    },
    {
      "name": "comprarTokenEvento",
      "discriminator": [
        28,
        248,
        238,
        62,
        221,
        49,
        213,
        234
      ],
      "accounts": [
        {
          "name": "evento",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "evento.id",
                "account": "evento"
              },
              {
                "kind": "const",
                "value": [
                  101,
                  118,
                  101,
                  110,
                  116,
                  111
                ]
              },
              {
                "kind": "account",
                "path": "evento.autoridad",
                "account": "evento"
              }
            ]
          }
        },
        {
          "name": "colaborador",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  108,
                  97,
                  98,
                  111,
                  114,
                  97,
                  100,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "evento"
              },
              {
                "kind": "account",
                "path": "comprador"
              }
            ]
          }
        },
        {
          "name": "cuentaCompradorTokenEvento",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "comprador"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenEvento"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "tokenEvento",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  111
                ]
              },
              {
                "kind": "account",
                "path": "evento"
              }
            ]
          }
        },
        {
          "name": "cuentaCompradorTokenAceptado",
          "writable": true
        },
        {
          "name": "bovedaEvento",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  118,
                  101,
                  100,
                  97,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  111
                ]
              },
              {
                "kind": "account",
                "path": "evento"
              }
            ]
          }
        },
        {
          "name": "comprador",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "cantidad",
          "type": "u64"
        }
      ]
    },
    {
      "name": "crearEvento",
      "discriminator": [
        199,
        96,
        145,
        53,
        132,
        130,
        108,
        32
      ],
      "accounts": [
        {
          "name": "evento",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "id"
              },
              {
                "kind": "const",
                "value": [
                  101,
                  118,
                  101,
                  110,
                  116,
                  111
                ]
              },
              {
                "kind": "account",
                "path": "autoridad"
              }
            ]
          }
        },
        {
          "name": "tokenAceptado"
        },
        {
          "name": "tokenEvento",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  111
                ]
              },
              {
                "kind": "account",
                "path": "evento"
              }
            ]
          }
        },
        {
          "name": "bovedaEvento",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  118,
                  101,
                  100,
                  97,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  111
                ]
              },
              {
                "kind": "account",
                "path": "evento"
              }
            ]
          }
        },
        {
          "name": "bovedaGanancias",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  118,
                  101,
                  100,
                  97,
                  95,
                  103,
                  97,
                  110,
                  97,
                  110,
                  99,
                  105,
                  97,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "evento"
              }
            ]
          }
        },
        {
          "name": "autoridad",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "id",
          "type": "string"
        },
        {
          "name": "nombre",
          "type": "string"
        },
        {
          "name": "descripcion",
          "type": "string"
        },
        {
          "name": "precioEntrada",
          "type": "f64"
        },
        {
          "name": "precioToken",
          "type": "f64"
        }
      ]
    },
    {
      "name": "eliminarEvento",
      "discriminator": [
        158,
        234,
        129,
        79,
        17,
        21,
        21,
        240
      ],
      "accounts": [
        {
          "name": "evento",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "evento.id",
                "account": "evento"
              },
              {
                "kind": "const",
                "value": [
                  101,
                  118,
                  101,
                  110,
                  116,
                  111
                ]
              },
              {
                "kind": "account",
                "path": "autoridad"
              }
            ]
          }
        },
        {
          "name": "bovedaEvento",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  118,
                  101,
                  100,
                  97,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  111
                ]
              },
              {
                "kind": "account",
                "path": "evento"
              }
            ]
          }
        },
        {
          "name": "bovedaGanancias",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  118,
                  101,
                  100,
                  97,
                  95,
                  103,
                  97,
                  110,
                  97,
                  110,
                  99,
                  105,
                  97,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "evento"
              }
            ]
          }
        },
        {
          "name": "tokenEvento",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  111
                ]
              },
              {
                "kind": "account",
                "path": "evento"
              }
            ]
          }
        },
        {
          "name": "autoridad",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "finalizarEvento",
      "discriminator": [
        81,
        168,
        190,
        34,
        62,
        255,
        192,
        61
      ],
      "accounts": [
        {
          "name": "evento",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "evento.id",
                "account": "evento"
              },
              {
                "kind": "const",
                "value": [
                  101,
                  118,
                  101,
                  110,
                  116,
                  111
                ]
              },
              {
                "kind": "account",
                "path": "autoridad"
              }
            ]
          }
        },
        {
          "name": "autoridad",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "retirarFondos",
      "discriminator": [
        198,
        220,
        159,
        15,
        90,
        39,
        4,
        252
      ],
      "accounts": [
        {
          "name": "evento",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "evento.id",
                "account": "evento"
              },
              {
                "kind": "const",
                "value": [
                  101,
                  118,
                  101,
                  110,
                  116,
                  111
                ]
              },
              {
                "kind": "account",
                "path": "autoridad"
              }
            ]
          }
        },
        {
          "name": "cuentaTokenAceptadoAutoridad",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "autoridad"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenAceptado"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "bovedaEvento",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  118,
                  101,
                  100,
                  97,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  111
                ]
              },
              {
                "kind": "account",
                "path": "evento"
              }
            ]
          }
        },
        {
          "name": "tokenAceptado"
        },
        {
          "name": "autoridad",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "cantidad",
          "type": "u64"
        }
      ]
    },
    {
      "name": "retirarGanancias",
      "discriminator": [
        182,
        137,
        175,
        180,
        191,
        81,
        244,
        248
      ],
      "accounts": [
        {
          "name": "evento",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "evento.id",
                "account": "evento"
              },
              {
                "kind": "const",
                "value": [
                  101,
                  118,
                  101,
                  110,
                  116,
                  111
                ]
              },
              {
                "kind": "account",
                "path": "evento.autoridad",
                "account": "evento"
              }
            ]
          }
        },
        {
          "name": "tokenEvento",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  101,
                  118,
                  101,
                  110,
                  116,
                  111
                ]
              },
              {
                "kind": "account",
                "path": "evento"
              }
            ]
          }
        },
        {
          "name": "cuentaColaboradorTokenAceptado",
          "writable": true
        },
        {
          "name": "cuentaColaboradorTokenEvento",
          "writable": true
        },
        {
          "name": "bovedaGanancias",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  118,
                  101,
                  100,
                  97,
                  95,
                  103,
                  97,
                  110,
                  97,
                  110,
                  99,
                  105,
                  97,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "evento"
              }
            ]
          }
        },
        {
          "name": "colaborador",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "colaborador",
      "discriminator": [
        20,
        51,
        77,
        170,
        99,
        208,
        44,
        122
      ]
    },
    {
      "name": "evento",
      "discriminator": [
        64,
        31,
        246,
        39,
        23,
        6,
        84,
        116
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "usuarioNoAutorizado",
      "msg": "Solo la autoridad del evento puede eliminarlo"
    },
    {
      "code": 6001,
      "name": "eventoConSponsors",
      "msg": "No puedes eliminar un evento con colaboradores"
    },
    {
      "code": 6002,
      "name": "bovedaDelEventoNoVacia",
      "msg": "No puedes eliminar el evento si la boveda del evento no esta vacia"
    },
    {
      "code": 6003,
      "name": "bovedaDeGananciasNoVacia",
      "msg": "No puedes eliminar el evento si la boveda de ganacias no esta vacia"
    },
    {
      "code": 6004,
      "name": "tokenIncorrecto",
      "msg": "Los tokens almacenados en la cuenta no corresponden al token esperado"
    },
    {
      "code": 6005,
      "name": "saldoInsuficiente",
      "msg": "La cuenta no tiene fondos suficientes"
    },
    {
      "code": 6006,
      "name": "eventoActivo",
      "msg": "El evento sigue activo"
    },
    {
      "code": 6007,
      "name": "cantidadInvalida",
      "msg": "La cantidad solicitada es invalida"
    },
    {
      "code": 6008,
      "name": "overflowError",
      "msg": "Overflow al intentar realizar la operacion"
    },
    {
      "code": 6009,
      "name": "tokensInsuficientes",
      "msg": "No hay suficientes tokens disponibles para la compra"
    }
  ],
  "types": [
    {
      "name": "colaborador",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "evento",
            "type": "pubkey"
          },
          {
            "name": "wallet",
            "type": "pubkey"
          },
          {
            "name": "tokensComprados",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "evento",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "string"
          },
          {
            "name": "nombre",
            "type": "string"
          },
          {
            "name": "descripcion",
            "type": "string"
          },
          {
            "name": "precioEntrada",
            "type": "u64"
          },
          {
            "name": "precioToken",
            "type": "u64"
          },
          {
            "name": "activo",
            "type": "bool"
          },
          {
            "name": "totalSponsors",
            "type": "u64"
          },
          {
            "name": "sponsorsActuales",
            "type": "u64"
          },
          {
            "name": "tokensVendidos",
            "type": "u64"
          },
          {
            "name": "entradasVendidas",
            "type": "u64"
          },
          {
            "name": "autoridad",
            "type": "pubkey"
          },
          {
            "name": "tokenAceptado",
            "type": "pubkey"
          },
          {
            "name": "bumpEvento",
            "type": "u8"
          },
          {
            "name": "bumpTokenEvento",
            "type": "u8"
          },
          {
            "name": "bumpBovedaEvento",
            "type": "u8"
          },
          {
            "name": "bumpBovedaGanancias",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
