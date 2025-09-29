import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Game from './Game.jsx'
import '@testing-library/jest-dom'
import { waitFor } from '@testing-library/react';

import { vi } from 'vitest'

const { getHandMock } = vi.hoisted(() => ({
  getHandMock: vi.fn(),
}));


vi.mock('../../services/HTTPService.js', () => {

  return {
    createHttpService: () => ({
      getHand: getHandMock
    })
  }
})


test("llama a getHand y guarda las cartas", async () => {
    
    // ACT
    render(<Game />);

    getHandMock.mockResolvedValueOnce(
     {
        "playerId": 1,
        "playerName": "Sherlock Holmes",
        "playerCards": [
            {
                "card_id": 1,
                "type": "Detective",
                "card_name": "Coronel Mustard",
                "image_name": "mustard_card.png",
                "image_back_name": "card_back.png"
            },
            {
                "card_id": 2,
                "type": "Detective",
                "card_name": "Candelabro",
                "image_name": "candelabro_card.png",
                "image_back_name": "card_back.png"
            },
            {
                "card_id": 3,
                "type": "Detective",
                "card_name": "Sala de Billar",
                "image_name": "billiard_card.png",
                "image_back_name": "card_back.png"
            }
        ],
        "playerSecret": [
            {
                "secret_id": 1,
                "secret_type": "Normal",
                "image_front_name": "secret_front_revealed.png",
                "image_back_name": "secret_back_revealed.png",
                "revealed": true
            },
            {
                "secret_id": 2,
                "secret_type": "Accomplice",
                "image_front_name": "secret_front_hidden.png",
                "image_back_name": "secret_back_hidden.png",
                "revealed": false
            }
        ]
      } 
    );

  
    // ASSERT
    await waitFor(() => {
      expect(getHandMock).toHaveBeenCalled();
    });
  });
