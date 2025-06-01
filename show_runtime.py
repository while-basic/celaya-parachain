#!/usr/bin/env python3
# ----------------------------------------------------------------------------
#  File:        show_runtime.py
#  Project:     Celaya Solutions (C-Suite Blockchain)
#  Created by:  Celaya Solutions, 2025
#  Author:      Christopher Celaya <chris@celayasolutions.com>
#  Description: Display runtime configuration and custom pallets
#  Version:     1.0.0
#  License:     BSL (SPDX id BUSL)
#  Last Update: (May 2025)
# ----------------------------------------------------------------------------

import re

def show_runtime_config():
    print("🔍 C-Suite Parachain Runtime Analysis")
    print("=====================================")
    print()
    
    try:
        with open('runtime/src/lib.rs', 'r') as f:
            content = f.read()
            
        print("📦 Configured Pallets:")
        print()
        
        # Find the runtime module
        runtime_match = re.search(r'mod runtime \{.*?\}', content, re.DOTALL)
        if runtime_match:
            runtime_content = runtime_match.group(0)
            
            # Extract pallet definitions
            pallet_pattern = r'#\[runtime::pallet_index\((\d+)\)\]\s+pub type (\w+) = ([^;]+);'
            pallets = re.findall(pallet_pattern, runtime_content)
            
            standard_pallets = []
            custom_pallets = []
            
            for index, name, impl_type in pallets:
                if 'pallet_' in impl_type and ('agent' in impl_type.lower() or 'consensus' in impl_type.lower() or 'template' in impl_type.lower()):
                    custom_pallets.append((index, name, impl_type))
                else:
                    standard_pallets.append((index, name, impl_type))
            
            print("🔧 Standard Substrate Pallets:")
            for index, name, impl_type in sorted(standard_pallets, key=lambda x: int(x[0])):
                print(f"  [{index:2}] {name:20} -> {impl_type}")
            
            print()
            print("⭐ Custom C-Suite Pallets:")
            for index, name, impl_type in sorted(custom_pallets, key=lambda x: int(x[0])):
                print(f"  [{index:2}] {name:20} -> {impl_type}")
            
            print()
            
        # Look for configuration implementations
        config_pattern = r'impl pallet_(\w+)::Config for Runtime \{[^}]+\}'
        configs = re.findall(config_pattern, content, re.DOTALL)
        
        print("⚙️  Pallet Configurations:")
        for config in configs:
            if 'agent' in config or 'consensus' in config:
                print(f"  ✅ pallet_{config} - Custom C-Suite pallet")
            else:
                print(f"  📋 pallet_{config}")
                
        print()
        
        # Extract agent registry config details
        agent_config_match = re.search(r'impl pallet_agent_registry::Config for Runtime \{([^}]+)\}', content, re.DOTALL)
        if agent_config_match:
            print("🤖 Agent Registry Configuration:")
            config_content = agent_config_match.group(1)
            role_length = re.search(r'MaxRoleLength = ConstU32<(\d+)>', config_content)
            metadata_length = re.search(r'MaxMetadataLength = ConstU32<(\d+)>', config_content)
            
            if role_length:
                print(f"  - Max Role Length: {role_length.group(1)} characters")
            if metadata_length:
                print(f"  - Max Metadata Length: {metadata_length.group(1)} characters")
            print()
        
        # Extract consensus config details
        consensus_config_match = re.search(r'impl pallet_consensus_log::Config for Runtime \{([^}]+)\}', content, re.DOTALL)
        if consensus_config_match:
            print("📊 Consensus Log Configuration:")
            config_content = consensus_config_match.group(1)
            # Extract various config parameters
            configs = {
                'MaxCIDLength': r'MaxCIDLength = ConstU32<(\d+)>',
                'MaxMetadataLength': r'MaxMetadataLength = ConstU32<(\d+)>',
                'MaxAgentsInvolved': r'MaxAgentsInvolved = ConstU32<(\d+)>',
                'MaxSignatures': r'MaxSignatures = ConstU32<(\d+)>'
            }
            
            for param, pattern in configs.items():
                match = re.search(pattern, config_content)
                if match:
                    print(f"  - {param}: {match.group(1)}")
            print()
            
    except FileNotFoundError:
        print("❌ Runtime file not found. Make sure you're in the project root.")
        return
    
    print("✨ Analysis complete! Your C-Suite parachain runtime is properly configured.")
    print()
    print("🚀 Next Steps:")
    print("1. Start the node: ./target/debug/parachain-template-node --dev --tmp")
    print("2. Connect to https://polkadot.js.org/apps")
    print("3. Set endpoint to ws://127.0.0.1:9944")
    print("4. Start registering your C-Suite agents!")

if __name__ == "__main__":
    show_runtime_config() 