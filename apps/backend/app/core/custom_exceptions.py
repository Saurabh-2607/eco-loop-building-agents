class EcoLoopException(Exception):
    """Base exception class for all EcoLoop system errors."""
    def __init__(self, message: str, code: str = "INTERNAL_ERROR"):
        self.message = message
        self.code = code
        super().__init__(self.message)

class DatabaseException(EcoLoopException):
    """Raised when database reads or writes encounter failures."""
    def __init__(self, message: str, code: str = "DATABASE_ERROR"):
        super().__init__(message, code)

class SimulationException(EcoLoopException):
    """Raised when EnergyPlus executions or control parameter updates fail."""
    def __init__(self, message: str, code: str = "SIMULATION_ERROR"):
        super().__init__(message, code)

class ValidationException(EcoLoopException):
    """Raised when API payloads or data inputs fail validations checks."""
    def __init__(self, message: str, code: str = "VALIDATION_ERROR"):
        super().__init__(message, code)

class OptimizationException(EcoLoopException):
    """Raised when AI agent reasoning cycles or target calculations fail."""
    def __init__(self, message: str, code: str = "OPTIMIZATION_ERROR"):
        super().__init__(message, code)
