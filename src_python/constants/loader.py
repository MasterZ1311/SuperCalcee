"""
CODATA Constants Database Loader
================================

Provides thread-safe access to standard CODATA physical and mathematical constants
stored in the accompanying `codata.json` dataset.

Features:
    - Automatic JSON file path resolution relative to current package directory.
    - Constant value retrieval by symbol (e.g. 'c', 'G', 'h', 'pi').
    - Measurement unit inspection for scientific calculations.
    - Comprehensive dictionary dump for API consumers.

Author: SuperCalcee Core Team
License: MIT
"""

import json
import os
from typing import Dict, Any, Union


class ConstantsDatabase:
    """
    Database manager for standard scientific and mathematical constants.
    """

    def __init__(self) -> None:
        """
        Initializes the constants database and loads JSON records from disk.
        """
        self.constants: Dict[str, Dict[str, Any]] = {}
        self.load()

    def load(self) -> None:
        """
        Reads and parses the `codata.json` file located in the constants directory.

        Raises:
            FileNotFoundError: If `codata.json` is missing.
            json.JSONDecodeError: If `codata.json` contains malformed JSON data.
        """
        filepath = os.path.join(os.path.dirname(__file__), "codata.json")
        with open(filepath, "r", encoding="utf-8") as f:
            self.constants = json.load(f)

    def get_value(self, symbol: str) -> Union[float, int]:
        """
        Retrieves the numerical value of a physical/mathematical constant by symbol.

        Args:
            symbol (str): Standard constant symbol (e.g., 'c', 'G', 'h', 'e0').

        Returns:
            Union[float, int]: Numerical magnitude of the constant.

        Raises:
            KeyError: If the requested symbol is not in the database.
        """
        if symbol in self.constants:
            return self.constants[symbol]["value"]
        raise KeyError(f"Constant '{symbol}' not found in CODATA database.")

    def get_unit(self, symbol: str) -> str:
        """
        Retrieves the SI unit string of a physical constant by symbol.

        Args:
            symbol (str): Standard constant symbol (e.g., 'c', 'G', 'R').

        Returns:
            str: SI unit representation (e.g., 'm/s', 'J/(mol·K)').

        Raises:
            KeyError: If the symbol is missing or has no associated unit.
        """
        if symbol in self.constants:
            return self.constants[symbol].get("unit", "")
        raise KeyError(f"Constant '{symbol}' not found in CODATA database.")

    def get_all(self) -> Dict[str, Dict[str, Any]]:
        """
        Returns the entire dictionary of loaded CODATA constants.

        Returns:
            Dict[str, Dict[str, Any]]: Complete map of symbols to metadata objects.
        """
        return self.constants


# Global database instance for direct module imports
DB = ConstantsDatabase()


def get_constant_value(symbol: str) -> Union[float, int]:
    """
    Convenience function to look up a constant value directly.

    Args:
        symbol (str): Symbol key of the constant (e.g., 'c').

    Returns:
        Union[float, int]: Value of the constant.
    """
    return DB.get_value(symbol)
