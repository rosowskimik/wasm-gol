use std::mem;

use wasm_bindgen::prelude::*;
use wee_alloc::WeeAlloc;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: WeeAlloc = WeeAlloc::INIT;

// Set console.error panic hook in debug mode
#[cfg(feature = "console_error_panic_hook")]
#[cfg(debug_assertions)]
#[wasm_bindgen(start)]
pub fn set_panic_hook() {
    console_error_panic_hook::set_once();
}

#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Cell {
    Dead = 0,
    Alive = 1,
}

impl Cell {
    fn toggle(&mut self) {
        *self = match *self {
            Cell::Dead => Cell::Alive,
            Cell::Alive => Cell::Dead,
        };
    }
}

#[wasm_bindgen]
pub struct Universe {
    // #[wasm_bindgen(readonly)]
    width: u32,
    // #[wasm_bindgen(readonly)]
    height: u32,
    cells: Vec<Cell>,
    backing_cells: Vec<Cell>,
}

#[wasm_bindgen]
impl Universe {
    fn live_neighbour_count(&self, column: u32, row: u32) -> u8 {
        let mut count = 0;
        for delta_row in [self.height - 1, 0, 1] {
            for delta_col in [self.width - 1, 0, 1] {
                if delta_row == 0 && delta_col == 0 {
                    continue;
                }

                let neighbour_column = (column + delta_col) % self.width;
                let neighbour_row = (row + delta_row) % self.height;
                let idx = self.get_index(neighbour_column, neighbour_row);
                count += self.cells[idx] as u8;
            }
        }

        count
    }

    #[wasm_bindgen(constructor)]
    pub fn new(width: u32, height: u32) -> Self {
        let cells_length = (width * height) as usize;
        Self {
            width,
            height,
            cells: vec![Cell::Dead; cells_length],
            backing_cells: vec![Cell::Dead; cells_length],
        }
    }

    pub fn resize(&mut self, width: u32, height: u32) {
        self.width = width;
        self.height = height;

        let cells_length = (width * height) as usize;
        self.cells = vec![Cell::Dead; cells_length];
        self.backing_cells.resize(cells_length, Cell::Dead);
    }

    #[wasm_bindgen(js_name = toggleCell)]
    pub fn toggle_cell(&mut self, column: u32, row: u32) {
        let idx = self.get_index(column, row);
        self.cells[idx].toggle();
    }

    #[wasm_bindgen(js_name = fillRandom)]
    pub fn fill_random(&mut self) {
        self.cells.iter_mut().for_each(|cell| {
            *cell = if js_sys::Math::random() < 0.75 {
                Cell::Dead
            } else {
                Cell::Alive
            };
        });
    }

    pub fn reset(&mut self) {
        self.cells.fill(Cell::Dead);
    }

    pub fn tick(&mut self) {
        (0..self.height).into_iter().for_each(|row| {
            (0..self.width).into_iter().for_each(|column| {
                let idx = self.get_index(column, row);
                let cell = self.cells[idx];
                let live_neighbours = self.live_neighbour_count(column, row);

                let next_cell = match (cell, live_neighbours) {
                    (Cell::Alive, 2) | (Cell::Alive, 3) => Cell::Alive,
                    (Cell::Alive, x) if x < 2 => Cell::Dead,
                    (Cell::Alive, x) if x > 3 => Cell::Dead,
                    (Cell::Dead, 3) => Cell::Alive,
                    (other, _) => other,
                };

                self.backing_cells[idx] = next_cell;
            });
        });

        mem::swap(&mut self.cells, &mut self.backing_cells);
    }

    #[wasm_bindgen(js_name = getIndex)]
    pub fn get_index(&self, column: u32, row: u32) -> usize {
        (row * self.width + column) as usize
    }

    pub fn cells(&self) -> *const Cell {
        self.cells.as_ptr()
    }
}
