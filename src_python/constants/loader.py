import json
import os

class ConstantsDatabase:
    def __init__(self):
        self.constants = {}
        self.load()

    def load(self):
        filepath = os.path.join(os.path.dirname(__file__), 'codata.json')
        with open(filepath, 'r', encoding='utf-8') as f:
            self.constants = json.load(f)

    def get_value(self, symbol: str):
        if symbol in self.constants:
            return self.constants[symbol]['value']
        raise KeyError(f"Constant '{symbol}' not found in CODATA database.")

    def get_unit(self, symbol: str):
        if symbol in self.constants:
            return self.constants[symbol]['unit']
        raise KeyError(f"Constant '{symbol}' not found in CODATA database.")

    def get_all(self):
        return self.constants

DB = ConstantsDatabase()

def get_constant_value(symbol):
    return DB.get_value(symbol)
