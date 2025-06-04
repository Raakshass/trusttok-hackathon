import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TrustTokModule = buildModule("TrustTokModule", (m) => {
  // Mock Graphite Trust Score contract address (for demo purposes)
  // In production, this would be the actual Graphite Network contract
  const mockGraphiteAddress = m.getParameter("graphiteAddress", "0x1234567890123456789012345678901234567890");
  
  // Deploy TrustTok contract
  const trustTok = m.contract("TrustTok", [mockGraphiteAddress]);

  return { trustTok };
});

export default TrustTokModule;
